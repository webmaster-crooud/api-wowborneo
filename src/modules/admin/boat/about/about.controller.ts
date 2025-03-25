import { Response, Request } from "express";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { aboutService } from "./about.service";
import { StatusCodes } from "http-status-codes";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { boatId } = req.params;
		if (!boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Boat Identify is required!");
		const body = req.body;
		await aboutService.create(boatId, body);
		log.createSuccess(accountId, `About`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, `About`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { aboutId } = req.params;
	try {
		const body = req.body;
		await aboutService.update(parseInt(aboutId), body);
		log.updateSuccess(accountId, `About ${aboutId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `About ${aboutId}`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { aboutId } = req.params;
	try {
		await aboutService.delete(parseInt(aboutId));
		log.deleteSuccess(accountId, `About ${aboutId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `About ${aboutId}`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
