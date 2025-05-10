import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { ICartAddonRequest, ISetCartRequest } from "./cart.type";
import { cartService } from "./cart.service";
import { IGuestRequest } from "../../types/transaction";

async function setCartController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { scheduleId } = req.params;
		if (!scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule is required");
		const body = req.body as ISetCartRequest;
		await cartService.setCart(accountId, scheduleId, body);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function getCartController(req: Request, res: Response) {
	try {
		const { accountId } = req.user;
		const { scheduleId } = req.params;
		if (!scheduleId && !accountId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule Identity is required");
		const data = await cartService.getCart(accountId, scheduleId);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function setAddonCartController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { scheduleId } = req.params;
		if (!scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule Identity is required");
		const body = req.body as ICartAddonRequest[];
		const data = await cartService.setAddonCart(accountId, scheduleId, body);
		console.log(data);

		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function setGuestCartController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { scheduleId } = req.params;
		const body = req.body as IGuestRequest[];
		const data = await cartService.setGuestCart(accountId, scheduleId, body);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function setMethodCartController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { scheduleId } = req.params;
		const body = req.body as { method: "dp" | "full" };
		const data = await cartService.setMethodCart(accountId, scheduleId, body);
		ApiResponse.sendSuccess(res, data, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { setCartController, getCartController, setAddonCartController, setGuestCartController, setMethodCartController };
