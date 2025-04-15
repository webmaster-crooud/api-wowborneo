import { Request, Response } from "express";
import { destinationService } from "./destination.service";

import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { STATUS } from "@prisma/client";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { cruiseId } = req.params;
		if (!cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const body = req.body;
		const result = await destinationService.create(accountId, cruiseId, body);
		log.createSuccess(accountId, "Destination");
		ApiResponse.sendSuccess(res, { result }, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Destination");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const body = req.body;
		await destinationService.update(parseInt(id), body);
		log.updateSuccess(accountId, "Destination");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Destination");
		ApiResponse.sendError(res, error as Error);
	}
}

async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { action } = req.query;
		const { id } = req.params;
		if (!action && !id) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const result = await destinationService.action(action as STATUS, parseInt(id));

		const data = {
			message: `Successfully to ${result.status} data ${result.title}`,
		};

		log.updateSuccess(accountId, `${result.status} Destination`);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Destination`);
		ApiResponse.sendError(res, error as Error);
	}
}

async function listController(req: Request, res: Response) {
	try {
		// const { search, filter, favourite, deleted } = req.query;
		const { search } = req.query;
		const searching: string | undefined = search !== "undefined" ? search?.toString() : undefined;
		const response = await destinationService.list(searching);
		ApiResponse.sendSuccess(res, response, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, updateController, actionController, listController };

// async function getController(req: Request, res: Response) {
// 	try {
// 		const data = await destinationService.get();
// 		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
// 	} catch (error) {
// 		ApiResponse.sendError(res, error as Error);
// 	}
// }
