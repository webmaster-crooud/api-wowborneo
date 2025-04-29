import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { refundService } from "./refund.service";
import { StatusCodes } from "http-status-codes";
import { log } from "../../../utils/logging";
import { REFUND_STATUS } from "@prisma/client";

async function listController(req: Request, res: Response) {
	try {
		const data = await refundService.list();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function detailController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Identity refund is must required!");
		const data = await refundService.detail(id);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id, action } = req.params;
		await refundService.action(id, action as REFUND_STATUS, accountId);
		log.updateSuccess(accountId, "Refund");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.updateFailed(accountId, "Refund");
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listController, detailController, actionController };
