import { Request, Response } from "express";
import { log } from "../../../utils/logging";
import { scheduleService } from "./schedule.service";
import { IScheduleRequestBody } from "../../../types/schedule";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "@prisma/client";

async function createController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body: IScheduleRequestBody = req.body;
		const { cruiseId, departureAt, boatId } = body;
		if (!cruiseId && !departureAt && !boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Process Failed, please check your input");
		await scheduleService.create(accountId, body);
		log.createSuccess(accountId, "Schedule");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.createFailed(accountId, "Schedule");
		ApiResponse.sendError(res, error as Error);
	}
}

async function listController(req: Request, res: Response) {
	try {
		const { search, date, cruiseId, pax } = req.query;

		const result = await scheduleService.list({
			search: String(search || ""),
			date: date ? new Date(String(date)) : undefined,
			cruiseId: String(cruiseId || ""),
			pax: Number(pax) || undefined,
		});

		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function listDeletedController(req: Request, res: Response) {
	try {
		const result = await scheduleService.listDeleted();
		ApiResponse.sendSuccess(res, result, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function findController(req: Request, res: Response) {
	try {
		const { scheduleId } = req.params;
		if (!scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule Identify is required!");
		const result = await scheduleService.find(scheduleId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { scheduleId } = req.params;
		const { action } = req.query;
		if (!scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule Identify is required!");
		if (!action) throw new ApiError(StatusCodes.BAD_REQUEST, "Action is required!");
		const result = await scheduleService.action(scheduleId, action as STATUS);
		log.updateSuccess(accountId, `${result.status} Schedule`);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body: IScheduleRequestBody = req.body;
		const { scheduleId } = req.params;
		const { cruiseId, departureAt, boatId } = body;
		if (!cruiseId && !departureAt && !boatId) throw new ApiError(StatusCodes.BAD_REQUEST, "Process Failed, please check your input");
		await scheduleService.update(scheduleId, body);
		log.updateSuccess(accountId, "Schedule");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, "Schedule");
		ApiResponse.sendError(res, error as Error);
	}
}

export default { createController, listController, listDeletedController, findController, actionController, updateController };
