import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ApiError } from "../libs/apiResponse";
import { StatusCodes } from "http-status-codes";

export const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: 20, // Maksimal 5 request per windowMs
	message: "Too many refresh attempts, please try again later until 15 Minutes",
	standardHeaders: true, // Tambahkan rate limit headers ke response
	legacyHeaders: false, // Nonaktifkan X-RateLimit-* headers lama

	// Custom error handler agar masuk ke middleware errorHandler
	handler: (req: Request, res: Response, next: NextFunction) => {
		const error = new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many refresh attempts, please try again later until 15 Minutes");
		next(error);
	},
});
