import { Response, Request } from "express";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { StatusCodes } from "http-status-codes";
import { experienceService } from "./experience.service";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { boatId } = req.params;
		if (!boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Boat Identify is required!");
		const body = req.body;
		const { id } = await experienceService.create(boatId, body);
		log.createSuccess(accountId, `Experiences`);
		ApiResponse.sendSuccess(res, id, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, `Experiences`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { experienceId } = req.params;
	try {
		const body = req.body;
		await experienceService.update(parseInt(experienceId), body);
		log.updateSuccess(accountId, `Experience ${experienceId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Experience ${experienceId}`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { experienceId } = req.params;
	try {
		await experienceService.delete(parseInt(experienceId));
		log.deleteSuccess(accountId, `Experience ${experienceId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Experience ${experienceId}`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
