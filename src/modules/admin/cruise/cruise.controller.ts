import { Request, Response } from "express";

import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { log } from "../../../utils/logging";
import { StatusCodes } from "http-status-codes";
import { cruiseService } from "./cruise.service";
import { STATUS } from "@prisma/client";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const response = await cruiseService.create(accountId, req.body);
		await log.createSuccess(accountId, "Cruise");
		ApiResponse.sendSuccess(res, { id: response.id, destinationIds: response.destinationIds, highlightIds: response.highlightIds }, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Cruise");
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		console.log(req.body);
		const { cruiseId } = req.params;
		if (!cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request!");
		await cruiseService.update(cruiseId, req.body);
		await log.updateSuccess(accountId, "Cruise");
		ApiResponse.sendSuccess(res, "ok", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Cruise");
		ApiResponse.sendError(res, error as Error);
	}
}
async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { action } = req.query;
		console.log(action);
		const { cruiseId } = req.params;
		if (!action && !cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const result = await cruiseService.action(action as STATUS, cruiseId, accountId);

		const data = {
			message: `Successfully to ${result.status} data ${result.title}`,
		};

		log.updateSuccess(accountId, `${result.status} Cruise`);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Cruise`);
		ApiResponse.sendError(res, error as Error);
	}
}
async function getController(req: Request, res: Response) {
	try {
		const { search, filter, favourite, deleted } = req.query;
		// Karena req.query mengembalikan nilai string atau undefined, kita perlu mengonversinya:
		const searching: string | undefined = search ? search.toString() : undefined;
		const orderDesc: boolean = filter === "true";
		const isFav: boolean = favourite === "true";
		const isDeleted: boolean = deleted === "true";
		const cruises = await cruiseService.get(searching, orderDesc, isFav, isDeleted);
		ApiResponse.sendSuccess(res, cruises, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function findController(req: Request, res: Response) {
	try {
		const { cruiseId } = req.params;
		const cruises = await cruiseService.find(cruiseId);

		ApiResponse.sendSuccess(res, cruises, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, actionController, getController, findController };
