import { Response, Request } from "express";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { StatusCodes } from "http-status-codes";
import { cabinService } from "./cabin.service";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { boatId } = req.params;
		if (!boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Boat Identify is required!");
		const body = req.body;
		const { id } = await cabinService.create(boatId, body);
		log.createSuccess(accountId, `Cabin`);
		ApiResponse.sendSuccess(res, id, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, `Cabin`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { cabinId } = req.params;
	try {
		const body = req.body;
		await cabinService.update(parseInt(cabinId), body);
		log.updateSuccess(accountId, `Cabin ${cabinId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Cabin ${cabinId}`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { cabinId } = req.params;
	try {
		await cabinService.delete(parseInt(cabinId));
		log.deleteSuccess(accountId, `Cabin ${cabinId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Cabin ${cabinId}`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
