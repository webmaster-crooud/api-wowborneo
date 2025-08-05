import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { cruiseService } from "./cruise.service";
import { StatusCodes } from "http-status-codes";

async function getPackageCruiseController(req: Request, res: Response) {
	try {
		const data = await cruiseService.listPackageCruise();
		ApiResponse.sendSuccess(res, data, 200);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function detailCruiseController(req: Request, res: Response) {
	try {
		const { slug } = req.params;
		if (!slug) throw new ApiError(StatusCodes.BAD_REQUEST, "Slug is required");
		const data = await cruiseService.find(slug);
		ApiResponse.sendSuccess(res, data, 200);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { getPackageCruiseController, detailCruiseController };
