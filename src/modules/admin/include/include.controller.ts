import { Request, Response } from "express";
import { includeService } from "./include.service";
import { log } from "../../../utils/logging";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { cruiseId } = req.params;
		if (!cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cruise ID");
		const body = req.body;
		const result = await includeService.create(cruiseId, body);
		log.createSuccess(accountId, "Include");
		ApiResponse.sendSuccess(res, { result }, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Include");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		console.log(id);
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid include ID");
		const body = req.body;
		await includeService.update(parseInt(id), body);
		log.updateSuccess(accountId, "Include");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Include");
		ApiResponse.sendError(res, error as Error);
	}
}

async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid parameters");
		await includeService.delete(parseInt(id));

		const data = {
			message: `Successfully delete include`,
		};

		log.deleteSuccess(accountId, `Delete Include`);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Delete Include`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
