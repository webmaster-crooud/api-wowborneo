import express from "express";
import rateLimit from "express-rate-limit";
import authController from "./auth.controller.js";
import { authRegisterValidation, changePassword, emailVerifyValidation, forgotPasswordValidation, loginValidation, resendEmailVerifyValidation } from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const authRoutes = express.Router();
// Rate limiter untuk refresh token
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: 30, // Maksimal 5 request per windowMs
	message: "Too many refresh attempts, please try again later",
});

authRoutes.post("/register", validate(authRegisterValidation), authController.registerController);
authRoutes.post("/verify", validate(emailVerifyValidation), authController.emailVerifyController);
authRoutes.post("/forgot-password/:email", validate(forgotPasswordValidation), rateLimiter, authController.forgotPasswordController);
authRoutes.patch("/verify/resend/:email", validate(resendEmailVerifyValidation), rateLimiter, authController.resendEmailVerifyController);
authRoutes.patch("/change-password", validate(changePassword), authController.changePasswordController);

// Auth Login
authRoutes.post("/", validate(loginValidation), authController.loginController);
authRoutes.patch("/", rateLimiter, authController.refreshTokenController);
authRoutes.get("/", authMiddleware, authController.getAccountController);
authRoutes.delete("/", authMiddleware, authController.logoutController);
