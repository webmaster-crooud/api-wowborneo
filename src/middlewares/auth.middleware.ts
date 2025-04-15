// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ApiError } from "../libs/apiResponse";
import { PayloadGenerateJWTToken } from "../libs/jwt";
import { env } from "../configs/env";
import prisma from "../configs/database";

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.accessToken;

	if (!token) {
		return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
	}

	try {
		const decoded = await new Promise<PayloadGenerateJWTToken>((resolve, reject) => {
			jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err: jwt.VerifyErrors | null, decoded: unknown) => {
				if (err) {
					return reject(err);
				}
				if (typeof decoded === "object" && decoded !== null && "accountId" in decoded) {
					resolve(decoded as PayloadGenerateJWTToken);
				} else {
					reject(new Error("Invalid token payload"));
				}
			});
		});

		const account = await prisma.account.findUnique({
			where: { id: decoded.accountId },
			select: {
				status: true,
				user: {
					select: {
						status: true,
					},
				},
			},
		});

		if (!account || (account.status !== "ACTIVED" && account.status !== "FAVOURITED") || account.user.status === "BLOCKED") {
			return next(new ApiError(StatusCodes.FORBIDDEN, "Akun terblokir"));
		}

		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(new ApiError(StatusCodes.UNAUTHORIZED, "Token expired"));
		}
		if (error instanceof Error) {
			return next(new ApiError(StatusCodes.FORBIDDEN, error.message));
		}
		next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error"));
	}
};
