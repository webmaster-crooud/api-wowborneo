import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "./auth.service";
import { RegisterInterface } from "../../types/auth";
import { ApiError, ApiResponse } from "../../libs/apiResponse";
import { env } from "../../configs/env";
import prisma from "../../configs/database";
import logger from "../../libs/logger";

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
		logger.info("Login attempt", { body: req.body });
		const body = req.body;
		if (!body) throw new ApiError(StatusCodes.BAD_GATEWAY, "Login gagal!");
		const result = await authService.login(body);
		const { account } = result;
		let redirectUrl = `/`; // Default redirect
		switch (account.role.name) {
			case "admin":
				redirectUrl = "admin";
				break;
			case "owner":
				redirectUrl = "owner";
				break;
			case "developer":
				redirectUrl = "developer";
				break;
			default:
				redirectUrl = `member`;
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

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		res.cookie("accessToken", result.accessToken, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "none",
			// domain: ".vercel.app",
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "none",
			// domain: ".vercel.app",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function refreshTokenController(req: Request, res: Response) {
	try {
		const { refreshToken } = req.cookies;
		if (!refreshToken) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
		const result = await authService.refreshToken(refreshToken);
		res.cookie("accessToken", result.accessToken, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "none",
			// domain: ".vercel.app",
			maxAge: 15 * 60 * 1000, // 15 minutes
		});
		ApiResponse.sendSuccess(res, { message: "Token refreshed" }, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function logoutController(req: Request, res: Response) {
	try {
		if (!req.user?.accountId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
		await prisma.accountRefreshToken.delete({
			where: { accountId: req.user.accountId },
		});

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
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
