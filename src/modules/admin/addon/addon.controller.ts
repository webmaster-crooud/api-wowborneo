import { Request, Response } from "express";
import { log } from "../../../utils/logging";
import { addonService } from "./addon.service";
import { ApiResponse } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "@prisma/client";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body = req.body;
		const result = await addonService.create(accountId, body);
		log.createSuccess(accountId, "Addon");
		ApiResponse.sendSuccess(res, result, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Addon");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body = req.body;
		const { addonId } = req.params;
		await addonService.update(body, Number(addonId));
		log.updateSuccess(accountId, "Addon");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Addon");
		ApiResponse.sendError(res, error as Error);
	}
}

async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { addonId } = req.params;
		const { action } = req.query;
		await addonService.action(Number(addonId), action as STATUS);
		log.updateSuccess(accountId, "Addon");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Addon");
		ApiResponse.sendError(res, error as Error);
	}
}
async function listController(req: Request, res: Response) {
	try {
		const result = await addonService.list();
		ApiResponse.sendSuccess(res, result, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function listPendingController(req: Request, res: Response) {
	try {
		const result = await addonService.listPending();
		ApiResponse.sendSuccess(res, result, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, actionController, listController, listPendingController };
