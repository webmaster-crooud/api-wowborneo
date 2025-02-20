import { NextFunction, Request, Response } from "express";
import { ApiError } from "../libs/apiResponse";
import logger from "../libs/logger";

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	logger.error(`${statusCode} - ${message}`, {
		url: req.originalUrl,
		method: req.method,
		stack: err.stack,
	});

	// Tambahkan errors ke respons
	res.status(statusCode).json({
		success: false,
		message,
		errors: err.errors || [], // <-- Ini yang kurang
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
	next();
};
