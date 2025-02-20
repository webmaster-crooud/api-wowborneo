import jwt from "jsonwebtoken";
import prisma from "../configs/database";
import { env } from "../configs/env";
export interface PayloadGenerateJWTToken {
	accountId: string;
	email: string;
	firstName: string;
	lastName: string;
	roleName: string;
	iat?: number; // Issued at (optional)
	exp?: number; // Expiration time (optional)
}

export function generateAccessToken(payload: PayloadGenerateJWTToken): string {
	return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

export async function generateRefreshToken(payload: PayloadGenerateJWTToken): Promise<string> {
	const token = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

	await prisma.accountRefreshToken.upsert({
		where: {
			accountId: payload.accountId,
			email: payload.email,
		},
		update: {
			token,
			expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			updatedAt: new Date(),
		},
		create: {
			token,
			email: payload.email,
			expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date(),
			accountId: payload.accountId,
		},
	});

	return token;
}
