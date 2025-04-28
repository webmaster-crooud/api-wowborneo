import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import bookingService from "./booking.service";
import { StatusCodes } from "http-status-codes";
import { log } from "../../../utils/logging";

async function listController(req: Request, res: Response) {
	try {
		const result = await bookingService.list();
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function detailController(req: Request, res: Response) {
	try {
		const { bookingId } = req.params;
		const result = await bookingService.detail(bookingId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function confirmedController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { bookingId, email } = req.params;
	try {
		if (!bookingId && !email) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Identity and Email is required!");
		const result = await bookingService.confirmed(bookingId, email, accountId);

		log.updateSuccess(accountId, "Confirmed Booking " + bookingId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		log.updateSuccess(accountId, "Confirmed Booking " + bookingId);
		ApiResponse.sendError(res, error as Error);
	}
}

async function checkinController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { bookingId } = req.params;
	try {
		if (!bookingId) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Identity is required!");
		const result = await bookingService.checkin(bookingId);

		log.updateSuccess(accountId, "Checkin Booking " + bookingId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		log.updateSuccess(accountId, "Checkin Booking " + bookingId);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listController, detailController, confirmedController, checkinController };
