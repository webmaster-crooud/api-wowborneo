import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "./auth.service";
import { RegisterInterface } from "../../types/auth";
import { ApiError, ApiResponse } from "../../libs/apiResponse";
import { env } from "../../configs/env";
import { redisClient } from "../../configs/redis";
import { generateAccessToken, generateRefreshToken, PayloadGenerateJWTToken } from "../../libs/jwt";

const generateToken = (sessionId: string) => `sess:${sessionId}`;
const ONE_DAY: number = 24 * 60 * 60 * 1000; // detik

const registerController = async (req: Request, res: Response) => {
	try {
		const { body }: { body: RegisterInterface } = req;
		const { ip }: { ip: string | undefined } = req;
		const userAgent = req.get("user-agent");
		if (!body) throw new ApiError(StatusCodes.BAD_REQUEST, "Request is not defined");

		const data = await authService.register(body, ip, userAgent || "");
		const { result } = data;
		ApiResponse.sendSuccess(res, result, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
};

async function emailVerifyController(req: Request, res: Response) {
	try {
		const { token } = req.query;
		if (!token || token === "") throw new ApiError(StatusCodes.BAD_REQUEST, "Token is required");

		await authService.emailVerify(String(token));
		const data = {
			redirect: "/?notification=Akun Member telah aktif, silahkan melakukan login dengan akun anda untuk mengakses Aplikasi Kami!",
		};
		ApiResponse.sendSuccess(res, data, StatusCodes.ACCEPTED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function resendEmailVerifyController(req: Request, res: Response) {
	try {
		const { email } = req.params;

		await authService.resendEmailVerify(email);
		const data = {
			message: "Silahkan melakukan verifikasi dengan kode OTP yang baru.",
		};
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function forgotPasswordController(req: Request, res: Response) {
	try {
		const { email } = req.params;
		await authService.forgotPassword(email);
		const redirect = "/login?notification=Lupa Password berhasil dikirim, silahkan cek Email anda untuk melanjutkan proses ganti password.";
		ApiResponse.sendSuccess(res, redirect, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function changePasswordController(req: Request, res: Response) {
	try {
		const body = req.body;
		await authService.changePassword(body);

		const data = {
			redirect: "/login?notification=Congratulation your password successfully to change with new password",
		};
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function loginController(req: Request, res: Response) {
	try {
		const body = req.body;
		if (!body) throw new ApiError(StatusCodes.BAD_GATEWAY, "Login gagal!");
		const result = await authService.login(body);
		const { account } = result;
		let redirectUrl = `/`; // Default redirect
		switch (account.role.name) {
			case "admin":
				redirectUrl = "/";
				break;
			case "owner":
				redirectUrl = "/";
				break;
			case "developer":
				redirectUrl = "/";
				break;
			default:
				redirectUrl = `/`;
		}

		const data = {
			redirect: env.DASHBOARD_URL + "/" + redirectUrl,
			account: {
				email: account.email,
				firstName: account.user.firstName,
				lastName: account.user.lastName,
				role: account.role.name,
			},
		};

		const sessionId = req.sessionID;
		const key = generateToken(sessionId);
		const session = await redisClient.get(key);
		const formatedSess = JSON.parse(session || "");
		const resultSession = {
			...formatedSess,
			refreshToken: result.refreshToken,
		};

		await redisClient.set(key, JSON.stringify(resultSession), "EX", ONE_DAY);
		res.clearCookie("accessToken", {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax", // Lebih aman untuk CSRF
			maxAge: 24 * 60 * 60 * 1000,
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		});
		res.cookie("accessToken", result.accessToken, {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax", // Lebih aman untuk CSRF
			maxAge: 24 * 60 * 60 * 1000,
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		});

		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function refreshTokenController(req: Request, res: Response) {
	try {
		// 1. Ambil sessionId dari express-session
		const sessionId = req.sessionID;
		if (!sessionId) {
			// Tidak ada session sama sekali → logout
			res.clearCookie("accessToken", { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" });
			return ApiResponse.sendError(res, new ApiError(StatusCodes.UNAUTHORIZED, "Session not found"));
		}

		// 2. Ambil data session di Redis
		const redisKey = generateToken(sessionId);
		const rawSession = await redisClient.get(redisKey);
		if (!rawSession) {
			// Session di Redis sudah expired / dihapus → logout
			res.clearCookie("accessToken", { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" });
			return ApiResponse.sendError(res, new ApiError(StatusCodes.UNAUTHORIZED, "Session expired"));
		}

		// 3. Parse session object, ambil storedRefreshToken
		const sessionData = JSON.parse(rawSession) as {
			refreshToken: string;
			[k: string]: any;
		};
		const { refreshToken: oldRefreshToken } = sessionData;

		// 4. Verifikasi signature refreshToken
		const decoded = jwt.verify(oldRefreshToken, env.REFRESH_TOKEN_SECRET) as PayloadGenerateJWTToken;

		// 5. Generate tokens baru
		const payload: PayloadGenerateJWTToken = {
			accountId: decoded.accountId,
			email: decoded.email,
			firstName: decoded.firstName,
			lastName: decoded.lastName,
			roleName: decoded.roleName,
		};
		const newAccessToken = generateAccessToken(payload);
		const newRefreshToken = await generateRefreshToken(payload);

		// 6. Rotate session di Redis: update stored refreshToken + extend expiry
		sessionData.refreshToken = newRefreshToken;
		await redisClient.set(redisKey, JSON.stringify(sessionData), "EX", ONE_DAY);

		// 7. Clear & set cookie accessToken baru
		res.clearCookie("accessToken", {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax",
			maxAge: ONE_DAY, // optional clear: same as loginController
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		}).cookie("accessToken", newAccessToken, {
			secure: env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax",
			maxAge: 15 * 60 * 1000, // 15 menit
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		});

		// 8. Kirim response sukses
		return ApiResponse.sendSuccess(res, { accessToken: newAccessToken }, StatusCodes.OK);
	} catch (err) {
		// Jika verifikasi JWT gagal, atau error lain → logout juga
		res.clearCookie("accessToken", { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" });
		return ApiResponse.sendError(res, err as Error);
	}
}

async function logoutController(req: Request, res: Response) {
	try {
		// 1. Pastikan ada session
		const sessionId = req.sessionID;
		if (!sessionId) {
			throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
		}

		// 2. Hapus session di Redis
		const redisKey = generateToken(sessionId);
		await redisClient.del(redisKey);

		// 3. Clear cookies (accessToken & session cookie)
		res.clearCookie("accessToken", {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "lax",
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		}).clearCookie("connect.sid", {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "lax",
			domain: env.NODE_ENV === "production" ? ".prooyek.com" : "localhost", // Penting!
			path: "/",
		});

		// 4. Response sukses
		return ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		return ApiResponse.sendError(res, error as Error);
	}
}

async function getAccountController(req: Request, res: Response) {
	try {
		if (!req.user?.accountId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
		const data = await authService.getAccount(req.user?.accountId);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default {
	registerController,
	emailVerifyController,
	resendEmailVerifyController,
	forgotPasswordController,
	changePasswordController,
	loginController,
	refreshTokenController,
	logoutController,
	getAccountController,
};
