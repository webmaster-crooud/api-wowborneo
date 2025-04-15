import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { bookingService } from "./booking.service";
import { StatusCodes } from "http-status-codes";

async function listController(req: Request, res: Response) {
	try {
		const { accountId } = req.user;
		const data = await bookingService.list(accountId);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function detailController(req: Request, res: Response) {
	try {
		const { accountId } = req.user;
		const { bookingId } = req.params;
		if (!bookingId) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Identity is required!");
		const data = await bookingService.detail(accountId, bookingId);
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listController, detailController };
