import { Request, Response } from "express";
import { ApiResponse } from "../../../libs/apiResponse";
import { BoatService } from "./boat.service";

export class BoatController {
	static async list(req: Request, res: Response) {
		try {
			const data = await BoatService.list();
			ApiResponse.sendSuccess(res, data, 200);
		} catch (error) {
			ApiResponse.sendError(res, error as Error);
		}
	}
}
