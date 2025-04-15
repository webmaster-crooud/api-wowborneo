import { Request, Response } from "express";
import { informationService } from "./information.service";

import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { cruiseId } = req.params;
		if (!cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cruise ID");
		const body = req.body;
		const result = await informationService.create(cruiseId, body);
		log.createSuccess(accountId, "Information");
		ApiResponse.sendSuccess(res, { result }, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Information");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid information ID");
		const body = req.body;
		await informationService.update(parseInt(id), body);
		log.updateSuccess(accountId, "Information");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Information");
		ApiResponse.sendError(res, error as Error);
	}
}

async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid parameters");
		await informationService.delete(parseInt(id));

		const data = {
			message: `Successfully delete information`,
		};

		log.deleteSuccess(accountId, `Delete Information`);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Delete Information`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
