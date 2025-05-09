import { URL } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import { csrfSync } from "csrf-sync";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import session from "express-session";
import { createClient } from "redis";
import { env } from "./configs/env";
import logger from "./libs/logger";
import prisma from "./configs/database";
import { errorHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/routes";
import { accountRouter } from "./modules/account/account.routes";
import { imageRoutes } from "./modules/image/image.routes";
import { ApiError } from "./libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { transactionRoutes } from "./modules/transaction/transaction.routes";
import "./job/updateExchangeRates";
import "./job/updateCompletedBooking";
import { memberRoutes } from "./modules/member/member.routes";
import { RedisStore } from "connect-redis";
import { homeRoutes } from "./modules/home/routes";
import { redisClient } from "./configs/redis";
import { cartRoutes } from "./modules/cart/cart.route";

// 1. Inisialisasi Redis Client
redisClient.on("error", (err) => logger.error(`Redis Client Error: ${err.message}`));

(async () => {
	await redisClient.connect();
	logger.info("Connected to Redis successfully");
})();

// 2. Konfigurasi Redis Store
const redisStore = new RedisStore({
	client: redisClient,
	prefix: "session:",
	ttl: 86340, // 7 hari dalam detik
});

const app = express();

// 3. Security Middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:"],
			},
		},
		crossOriginEmbedderPolicy: false,
	})
);
app.disable("x-powered-by");

// 4. CORS Configuration
const allowedOrigins = env.CORS_ORIGINS.split(",");

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				logger.warn(`Blocked by CORS: ${origin}`);
				callback(new ApiError(StatusCodes.FORBIDDEN, "Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
	})
);

// 5. Session Configuration dengan Redis
app.use(
	session({
		store: redisStore,
		secret: env.SESSION_KEY,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "strict",
			maxAge: 1 * 24 * 60 * 60 * 1000,
			domain: env.NODE_ENV === "production" ? ".domain.com" : undefined,
		},
	})
);

// 6. CSRF Protection
const { csrfSynchronisedProtection, generateToken } = csrfSync({
	getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
	size: 64,
	ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});
app.use(csrfSynchronisedProtection);

// 7. Body Parser & Cookie Parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(env.COOKIE_SECRET));

// 8. Request Logging
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
	next();
});

// 9. Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/upload", imageRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/member", memberRoutes);
app.use("/api/v1/home", homeRoutes);

// 10. Security Headers
app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "same-origin");
	next();
});

// 11. Health Check & CSRF Endpoint
app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		redis: redisClient.isReady ? "connected" : "disconnected",
	});
});

app.get("/api/v1/csrf-token", (req, res) => {
	res.json({
		csrfToken: generateToken(req),
		timestamp: new Date().toISOString(),
	});
});

// 12. Error Handling
app.use(errorHandler);

// 13. Database & Server Startup
prisma
	.$connect()
	.then(() => {
		logger.info("Database connected");
		const server = app.listen(env.PORT, () => {
			logger.info(`Server running on ${env.BASE_URL}:${env.PORT}`);
		});

		const shutdown = async () => {
			logger.info("Shutting down gracefully...");
			await prisma.$disconnect();
			await redisClient.quit();
			server.close(() => {
				logger.info("Server closed");
				process.exit(0);
			});
		};

		process.on("SIGTERM", shutdown);
		process.on("SIGINT", shutdown);
	})
	.catch((err: Error) => {
		logger.error("Database connection failed", err);
		process.exit(1);
	});
