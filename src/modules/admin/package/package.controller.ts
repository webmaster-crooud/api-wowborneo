import { Request, Response } from "express";
import { ApiResponse } from "../../../libs/apiResponse";
import { packageService } from "./package.service";
import { StatusCodes } from "http-status-codes";

async function listPackageController(res: Response, req: Request) {
	try {
		const data = await packageService.list();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listPackageController };
