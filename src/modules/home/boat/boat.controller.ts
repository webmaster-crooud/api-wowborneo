import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../libs/apiResponse";
import { BoatService } from "./boat.service";

export const boatController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await BoatService.list();
			ApiResponse.sendSuccess(res, data, 200);
		} catch (error) {
			ApiResponse.sendError(res, error as Error);
		}
	},

	// get boat list data for boats page.
	async page(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await BoatService.page();
			ApiResponse.sendSuccess(res, data, 200);
		} catch (error) {
			ApiResponse.sendError(res, error as Error);
		}
	},

	// get minimal boat list data.
	async minimal(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await BoatService.minimal();
			ApiResponse.sendSuccess(res, data, 200);
		} catch (error) {
			ApiResponse.sendError(res, error as Error);
		}
	},

	// get boat detail by slug.
	async detail(req: Request, res: Response, next: NextFunction) {
		try {
			const { slug } = req.params;
			const data = await BoatService.detailBySlug(slug);
			if (!data) {
				return res.status(404).json({ message: "Boat not found" });
			}
			ApiResponse.sendSuccess(res, data, 200);
		} catch (error) {
			ApiResponse.sendError(res, error as Error);
		}
	},
};
