import { Response, Request } from "express";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { StatusCodes } from "http-status-codes";
import { facilityService } from "./facilities.service";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { boatId } = req.params;
		if (!boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Boat Identify is required!");
		const body = req.body;
		await facilityService.create(boatId, body);
		log.createSuccess(accountId, `Facility`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, `Facility`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { facilityId } = req.params;
	try {
		const body = req.body;
		await facilityService.update(parseInt(facilityId), body);
		log.updateSuccess(accountId, `Facility ${facilityId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Facility ${facilityId}`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { facilityId } = req.params;
	try {
		await facilityService.delete(parseInt(facilityId));
		log.deleteSuccess(accountId, `Facility ${facilityId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Facilitys ${facilityId}`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
