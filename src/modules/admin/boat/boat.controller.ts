import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { log } from "../../../utils/logging";
import { boatService } from "./boat.service";
import { STATUS } from "@prisma/client";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const result = await boatService.create(accountId, req.body);
		const data = {
			boatId: result.boat.id,
			deckId: result.boat.id,
			cabinsId: result.cabinsId,
			experiencesId: result.experiencesId,
		};
		log.createSuccess(accountId, "Boats");
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Boats");
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
		const boat = await boatService.get(searching, orderDesc, isFav, isDeleted);
		ApiResponse.sendSuccess(res, boat, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function getPaginatedController(req: Request, res: Response) {
	try {
		const { search, filter, favourite, deleted, page } = req.query;
		// Karena req.query mengembalikan nilai string atau undefined, kita perlu mengonversinya:
		const searching: string | undefined = search ? search.toString() : undefined;
		const orderDesc: boolean = filter === "true";
		const isFav: boolean = favourite === "true";
		const isDeleted: boolean = deleted === "true";
		const pageNumber: number = page ? parseInt(page.toString(), 10) : 1;

		const boat = await boatService.getPaginated(searching, orderDesc, isFav, isDeleted, pageNumber);
		ApiResponse.sendSuccess(res, boat, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function detailController(req: Request, res: Response) {
	try {
		const { boatId } = req.params;
		const result = await boatService.find(boatId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { boatId } = req.params;
		const body = req.body;
		const result = await boatService.update(boatId, body);
		log.updateSuccess(accountId, "boat");
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		log.updateFailed(accountId, "boat");
		ApiResponse.sendError(res, error as Error);
	}
}
async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { action } = req.query;
		const { boatId } = req.params;
		if (!action && !boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const result = await boatService.action(action as STATUS, boatId, accountId);

		const data = {
			message: `Successfully to ${result.status} data ${result.name}`,
		};

		log.updateSuccess(accountId, `${result.status} Boat`);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Boat`);
		ApiResponse.sendError(res, error as Error);
	}
}
export default { createController, getController, detailController, updateController, actionController, getPaginatedController };
