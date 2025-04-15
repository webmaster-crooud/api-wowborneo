import { Request, Response } from "express";
import { highlightService } from "./highlight.service";
import { log } from "../../../../utils/logging";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { cruiseId } = req.params;
		if (!cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid cruise ID");
		const body = req.body;
		const result = await highlightService.create(cruiseId, body);
		log.createSuccess(accountId, "Highlight");
		ApiResponse.sendSuccess(res, { result }, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Highlight");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid highlight ID");
		const body = req.body;
		await highlightService.update(parseInt(id), body);
		log.updateSuccess(accountId, "Highlight");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Highlight");
		ApiResponse.sendError(res, error as Error);
	}
}

async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid parameters");
		await highlightService.delete(parseInt(id));

		const data = {
			message: `Successfully delete highlight`,
		};

		log.deleteSuccess(accountId, `Delete Highlight`);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		log.deleteFailed(accountId, `Highlight`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, deleteController };
