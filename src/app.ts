// import { URL } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import { csrfSync } from "csrf-sync";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
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

// Mengatasi deprecation warning untuk punycode
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// (global as any).URL = URL;
process.throwDeprecation = true;
const app = express();

// 1. Enhanced Security Middleware
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
	})
);
app.disable("x-powered-by");

// 2. Dynamic CORS Configuration
const allowedOrigins = env.CORS_ORIGINS.split(",");
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				logger.warn(`Blocked by CORS: ${origin}`);
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
	})
);

// 3. Rate Limiting with Different Tiers
// const generalLimiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 100,
// 	standardHeaders: true, // Tambahkan rate limit headers ke response
// 	legacyHeaders: false, // Nonaktifkan X-RateLimit-* headers lama

// 	// Custom error handler agar masuk ke middleware errorHandler
// 	handler: (req: Request, res: Response, next: NextFunction) => {
// 		const error = new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many refresh attempts, please try again later until 15 Minutes");
// 		next(error);
// 	},
// });

// const authLimiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 50,
// 	standardHeaders: true,
// 	legacyHeaders: false,
// });

// app.use(generalLimiter);
// app.use("/api/v1/auth", authLimiter);

// 4. Secure Session Configuration
app.use(
	session({
		secret: env.SESSION_KEY,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		},
	})
);

// 5. Enhanced CSRF Protection
const { csrfSynchronisedProtection, generateToken } = csrfSync({
	getTokenFromRequest: (req) => {
		// Ambil token dari header
		const token = req.headers["x-csrf-token"];
		return Array.isArray(token) ? token[0] : token || "";
	},
	size: 64, // Panjang token 64 bytes
	ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});
app.use(csrfSynchronisedProtection);

// 6. Body Parser with Sanitization
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(env.COOKIE_SECRET));

// 7. Request Logging Middleware
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.originalUrl}`);
	next();
});

// 8. Routes
// app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/upload", imageRoutes);

// 9. Security Headers Middleware
app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	next();
});

// 10. Health Check Endpoint
app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 11. CSRF Token Endpoint
app.get("/api/v1/csrf-token", (req, res) => {
	res.json({
		csrfToken: generateToken(req),
		timestamp: new Date().toISOString(),
	});
});

// 12. Enhanced Error Handling
app.use(errorHandler);

// 13. Database Connection & Server Startup
prisma
	.$connect()
	.then(() => {
		logger.info("Database connected");
		const server = app.listen(env.PORT, () => {
			logger.info(`Server running on ${env.BASE_URL}:${env.PORT}`);
		});

		// Handle shutdown gracefully
		const shutdown = () => {
			server.close(async () => {
				await prisma.$disconnect();
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
