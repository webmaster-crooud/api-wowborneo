import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { memberService } from "./member.service";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "@prisma/client";
import { log } from "../../../utils/logging";

async function listController(req: Request, res: Response) {
	try {
		let { search } = req.query;
		const result = await memberService.list(search ? search.toString() : undefined);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (err) {
		ApiResponse.sendError(res, err as Error);
	}
}

async function listPaginatedController(req: Request, res: Response) {
	try {
		let { search, page } = req.query;
		const searching: string | undefined = search ? search.toString() : undefined;
		const pageNumber: number = page ? parseInt(page.toString(), 10) : 1;

		const result = await memberService.listPaginated(searching, pageNumber);

		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (err) {
		ApiResponse.sendError(res, err as Error);
	}
}

async function actionController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { action } = req.query;
		const { memberId } = req.params;
		if (!action && !memberId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const result = await memberService.action(action as STATUS, memberId, accountId);

		const data = {
			message: `Successfully to ${result.status} data ${result.user.firstName}`,
		};

		log.updateSuccess(accountId, `${result.status} Account`);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Account`);
		ApiResponse.sendError(res, error as Error);
	}
}

async function changeRoleController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { roleId } = req.query;
		const { memberId } = req.params;
		if (!roleId && !memberId) throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to processing request");
		const result = await memberService.changeRole(Number(roleId), memberId, accountId);

		const data = {
			message: `Successfully to ${result.role.name} data ${result.user.firstName}`,
		};

		log.updateSuccess(accountId, `${result.role.name} Account`);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Account`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listController, actionController, changeRoleController, listPaginatedController };
