import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import authController from "./auth.controller";
import { authRegisterValidation, changePassword, emailVerifyValidation, forgotPasswordValidation, loginValidation, resendEmailVerifyValidation } from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ApiError } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";

export const authRoutes = express.Router();

// Rate limiter untuk refresh token
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: 10, // Maksimal 5 request per windowMs
	message: "Too many refresh attempts, please try again later until 15 Minutes",
	standardHeaders: true, // Tambahkan rate limit headers ke response
	legacyHeaders: false, // Nonaktifkan X-RateLimit-* headers lama

	// Custom error handler agar masuk ke middleware errorHandler
	handler: (req: Request, res: Response, next: NextFunction) => {
		const error = new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many refresh attempts, please try again later until 15 Minutes");
		next(error);
	},
});

authRoutes.post("/register", validate(authRegisterValidation), rateLimiter, authController.registerController);
authRoutes.post("/verify", validate(emailVerifyValidation), rateLimiter, authController.emailVerifyController);
authRoutes.post("/forgot-password/:email", validate(forgotPasswordValidation), rateLimiter, authController.forgotPasswordController);
authRoutes.patch("/verify/resend/:email", validate(resendEmailVerifyValidation), rateLimiter, authController.resendEmailVerifyController);
authRoutes.patch("/change-password", validate(changePassword), rateLimiter, authController.changePasswordController);

// Auth Login
authRoutes.post("/", validate(loginValidation), rateLimiter, authController.loginController);
authRoutes.patch("/", rateLimiter, authController.refreshTokenController);
authRoutes.get("/", authMiddleware, authController.getAccountController);
authRoutes.delete("/", authMiddleware, authController.logoutController);
