import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { getExchangeRate } from "../../../utils/exhangeRates";
import { ICalculateRefundAmountResponse, IRefundRequest, IRefundBookingResponse } from "./refund.types";

export const refundService = {
	async calculateRefundAmount(bookingId: string): Promise<ICalculateRefundAmountResponse> {
		const dateNow = new Date();

		// Get booking data with schedule
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: { schedule: true },
		});

		if (!booking || !booking.schedule) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Booking or associated schedule not found");
		}
		if (booking.bookingStatus === "CHECKIN" || booking.bookingStatus === "COMPLETED") {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already completed, it's can't be refunded");
		}

		// Get departure date and current date (both set to midnight)
		const departureDate = new Date(booking.schedule.departureAt);
		const today = new Date(dateNow);
		departureDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);

		// Calculate days difference
		const timeDiff = departureDate.getTime() - today.getTime();
		const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

		// Determine refund percentage
		let refundPercentage = 0;
		if (daysDiff > 0) {
			if (daysDiff > 30) {
				refundPercentage = 100;
			} else if (daysDiff >= 15) {
				refundPercentage = 30;
			} // else: tetap 0%
		} // else: sudah lewat atau hari H, 0%

		// Calculate refund amount
		const refundAmount = Number(booking.finalPrice) * (refundPercentage / 100);

		const idr = await getExchangeRate();
		return {
			amount: refundAmount.toString(),
			amountIDR: String(Number(refundAmount) * Number(idr)),
			percent: refundPercentage,
			days: daysDiff,
		};
	},

	async createRefund(bookingId: string, request: IRefundRequest) {
		const booking = await prisma.booking.findUnique({
			where: {
				id: bookingId,
			},
		});
		const refund = await prisma.refund.findFirst({
			where: {
				bookingId: bookingId,
			},
		});

		if (refund) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already request refund!");

		if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found!");

		if (booking.bookingStatus === "COMPLETED" || booking.bookingStatus === "CHECKIN") throw new ApiError(StatusCodes.BAD_REQUEST, "This booking is not allowed to refund!");
		await prisma.$transaction(async (tx) => {
			await tx.booking.update({
				where: {
					id: bookingId,
				},
				data: {
					paymentType: "Refund Payment",
					bookingStatus: "CANCELLED",
				},
			});
			await tx.refund.create({
				data: {
					bookingId: bookingId,
					amount: request.amount,
					amountIDR: request.amountIDR,
					price: request.price,
					percent: request.percent,
					reason: request.reason,
					bankName: request.bankName,
					bankNumber: request.bankNumber,
					bankOwner: request.bankOwner,
					createdAt: new Date(),
					updatedAt: new Date(),
					refundMethod: request.refundMethod,
				},
			});
		});
	},

	async bookingRefund(bookingId: string, accountId: string): Promise<IRefundBookingResponse> {
		const booking = await prisma.booking.findUnique({
			where: {
				account: {
					id: accountId,
				},
				id: bookingId,
				bookingStatus: "CANCELLED",
			},
			select: {
				id: true,
				refunds: {
					select: {
						id: true,
						amount: true,
						amountIDR: true,
						createdAt: true,
						price: true,
						percent: true,
						status: true,
						refundMethod: true,
						updatedAt: true,
					},
					orderBy: {
						updatedAt: "desc",
					},
					take: 1,
				},
			},
		});

		if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Your booking is not found!");

		const formattedData: IRefundBookingResponse = {
			amount: booking?.refunds[0].amount || "",
			amountIDR: booking?.refunds[0].amountIDR || "",
			status: booking?.refunds[0].status || "PENDING",
			id: booking?.refunds[0].id || "",
			percent: booking?.refunds[0].percent || 0,
			refundMethod: booking?.refunds[0].refundMethod || "",
			createdAt: booking?.refunds[0].createdAt || "",
			updatedAt: booking?.refunds[0].updatedAt || "",
		};
		return formattedData;
	},
};
