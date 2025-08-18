import { Request, Response } from "express";
import { log } from "../../../utils/logging";
import { ApiResponse } from "../../../libs/apiResponse";
import { promotionService } from "./promotion.service";
import { StatusCodes } from "http-status-codes";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body = req.body;
		await promotionService.create(body);
		log.createSuccess(accountId, "Promotion");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Promotion");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		const body = req.body;
		await promotionService.update(id, body);
		log.updateSuccess(accountId, "Promotion");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Promotion");
		ApiResponse.sendError(res, error as Error);
	}
}

async function listController(req: Request, res: Response) {
	try {
		const data = await promotionService.list();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function listPaginatedController(req: Request, res: Response) {
	try {
		let { search, page } = req.query;
		const searching: string | undefined = search ? search.toString() : undefined;
		const pageNumber: number = page ? parseInt(page.toString(), 10) : 1;

		const data = await promotionService.listPaginated(searching, pageNumber);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function deleteController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		await promotionService.delete(id);
		log.deleteSuccess(accountId, "Promotion");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.deleteFailed(accountId, "Promotion");
		ApiResponse.sendError(res, error as Error);
	}
}
export default { createController, listController, updateController, deleteController, listPaginatedController };
