import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ApiResponse {
	static sendSuccess<T>(res: Response, data: T, statusCode: StatusCodes = 200) {
		res.status(statusCode).json({ success: true, data });
	}

	static sendError(res: Response, error: Error | { statusCode?: number; message?: string }) {
		const statusCode = "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
		const message = error.message || "Internal Server Error";

		res.status(statusCode).json({ success: false, message });
	}
}

export class ApiError extends Error {
	constructor(
		public statusCode: number,
		message: string,
		public errors?: Record<string, unknown>[]
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
