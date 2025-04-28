import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { refundService } from "./refund.service";
import { StatusCodes } from "http-status-codes";

async function getRefundAmountController(req: Request, res: Response) {
	try {
		const { bookingId } = req.params;
		if (!bookingId) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Id is required!");
		const response = await refundService.calculateRefundAmount(bookingId);
		ApiResponse.sendSuccess(res, response, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function createController(req: Request, res: Response) {
	try {
		const { bookingId } = req.params;
		const body = req.body;
		if (!bookingId) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Id is required!");
		const response = await refundService.createRefund(bookingId, body);
		ApiResponse.sendSuccess(res, response, StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function getBookingRefundController(req: Request, res: Response) {
	try {
		const { bookingId } = req.params;
		const { accountId } = req.user;
		if (!bookingId) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Id is required!");
		const response = await refundService.bookingRefund(bookingId, accountId);
		ApiResponse.sendSuccess(res, response, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export default { getRefundAmountController, createController, getBookingRefundController };
