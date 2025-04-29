import { Request, Response } from "express";
import { ApiResponse } from "../../../libs/apiResponse";
import { log } from "../../../utils/logging";
import { agentService } from "./agent.service";
import { StatusCodes } from "http-status-codes";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body = req.body;
		await agentService.create(body);
		log.createSuccess(accountId, "Agent");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Agent");
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { id } = req.params;
		const body = req.body;
		await agentService.update(id, body);
		log.createSuccess(accountId, "Agent");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Agent");
		ApiResponse.sendError(res, error as Error);
	}
}

async function listController(req: Request, res: Response) {
	try {
		const data = await agentService.list();
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, listController, updateController };
