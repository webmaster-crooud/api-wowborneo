import { Request, Response } from "express";
import { ApiResponse } from "../../libs/apiResponse";
import { accountService } from "./account.service";
import { StatusCodes } from "http-status-codes";
import { IChangePassword, IUpdateAccount } from "../../types/account";
import { log } from "../../utils/logging";

async function findController(req: Request, res: Response) {
	try {
		const { email } = req.user;
		const response = await accountService.find(email);
		ApiResponse.sendSuccess(res, response, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		await accountService.update(accountId, req.body as IUpdateAccount);
		log.updateSuccess(accountId, `Account Profile`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.updateFailed(accountId, `Account Profile`);
		ApiResponse.sendError(res, error as Error);
	}
}

async function checkPhotoController(req: Request, res: Response) {
	try {
		const { accountId } = req.user;
		const result = await accountService.checkPhoto(accountId);
		ApiResponse.sendSuccess(res, result.id, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function changePasswordController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		await accountService.changePassword(accountId, req.body as IChangePassword);
		log.updateSuccess(accountId, `Change Password`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.updateFailed(accountId, `Change Password`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { findController, updateController, checkPhotoController, changePasswordController };
