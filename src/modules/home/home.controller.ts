import { Request, Response } from "express";
import { ApiResponse } from "../../libs/apiResponse";
import { homeService } from "./home.service";
import { StatusCodes } from "http-status-codes";

async function homePageController(req: Request, res: Response) {
	try {
		const data = await homeService.getDataHome();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function navbarController(req: Request, res: Response) {
	try {
		const data = await homeService.getNavbar();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { homePageController, navbarController };
