import { URL } from "url";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { csrfSync } from "csrf-sync";
import { RedisStore } from "connect-redis";
import { env } from "./configs/env";
import { redisClient } from "./configs/redis";
import prisma from "./configs/database";
import logger from "./libs/logger";
import { ApiError } from "./libs/apiResponse";
import { errorHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/routes";
import { accountRouter } from "./modules/account/account.routes";
import { imageRoutes } from "./modules/image/image.routes";
import { transactionRoutes } from "./modules/transaction/transaction.routes";
import { cartRoutes } from "./modules/cart/cart.route";
import { memberRoutes } from "./modules/member/member.routes";
import { homeRoutes } from "./modules/home/routes";
import "./job/updateExchangeRates";
import "./job/updateCompletedBooking";
import { StatusCodes } from "http-status-codes";

// Konfigurasi Express app
const app = express();
// 1. Security Headers via Helmet
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

// 2. CORS Configuration
const allowedOrigins = env.CORS_ORIGINS.split(",");
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			logger.warn(`Blocked by CORS: ${origin}`);
			callback(new ApiError(StatusCodes.FORBIDDEN, "Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
		exposedHeaders: ["Set-Cookie", "X-CSRF-Token"],
	})
);

// 3. Parsers & CSRF Setup
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (env.NODE_ENV === "production") {
	app.set("trust proxy", 1);
}

const { csrfSynchronisedProtection, generateToken } = csrfSync({
	getTokenFromRequest: (req: Request) => {
		// Cek token dari header terlebih dahulu
		return (req.headers["x-csrf-token"] as string) || req.session.csrfToken;
	},
	size: 64,
	ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

// 4. Session Configuration with RedisStore
const redisStore = new RedisStore({
	client: redisClient,
	prefix: "sess:",
	ttl: 7 * 24 * 60 * 60, // 7 hari
});

app.use(
	session({
		store: redisStore,
		secret: env.SESSION_KEY,
		resave: false,
		saveUninitialized: false, // Pastikan false untuk keamanan
		rolling: true,
		cookie: {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax", // Lebih aman untuk CSRF
			maxAge: 24 * 60 * 60 * 1000,
		},
	})
);
// Apply CSRF protection
app.use(csrfSynchronisedProtection);

// // 5. Request Logging Middleware
// app.use((req: Request, res: Response, next: NextFunction) => {
// 	logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
// 	next();
// });

// 6. Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/upload", imageRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/member", memberRoutes);
app.use("/api/v1/home", homeRoutes);

// 7. Additional Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "same-origin");
	next();
});

// 8. Health Check & CSRF Token Endpoints
app.get("/health", (req: Request, res: Response) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		redis: redisClient.status,
	});
});

app.get("/api/v1/csrf-token", (req: Request, res: Response) => {
	// Tambahkan header untuk ekspos header kustom ke frontend
	res.header("Access-Control-Expose-Headers", "X-CSRF-Token");

	// Generate token dan attach ke header
	const csrfToken = generateToken(req);
	res.setHeader("X-CSRF-Token", csrfToken);

	res.json({
		csrfToken,
		timestamp: new Date().toISOString(),
	});
});

// 9. Error Handling Middleware
app.use(errorHandler);

// 10. Connect to Database & Start Server
prisma
	.$connect()
	.then(() => {
		logger.info("✅ Database connected");
		const server = app.listen(env.PORT, () => {
			const url = env.NODE_ENV === "production" ? env.BASE_URL : `${env.BASE_URL}:${env.PORT}`;
			logger.info(`🚀 Server running at ${url}`);
		});

		// Graceful shutdown
		const shutdown = async () => {
			logger.info("Shutting down gracefully...");

			try {
				await Promise.all([prisma.$disconnect(), redisClient.quit().catch((e) => logger.error("Redis shutdown error:", e))]);
				logger.info("All connections closed");
			} catch (err) {
				logger.error("Shutdown error:", err);
			} finally {
				server.close(() => {
					logger.info("Server closed");
					process.exit(0);
				});
			}
		};

		process.on("SIGTERM", shutdown);
		process.on("SIGINT", shutdown);
	})
	.catch((err: Error) => {
		logger.error("Database connection failed", err);
		process.exit(1);
	});
