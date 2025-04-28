import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IAdminRefundBookingResponse, IAdminRefundDetailResponse } from "./refund.type";
import { REFUND_STATUS } from "@prisma/client";

export const refundService = {
	async list(): Promise<IAdminRefundBookingResponse[]> {
		const refund = await prisma.refund.findMany({
			select: {
				id: true,
				amount: true,
				amountIDR: true,
				bookingId: true,
				percent: true,
				status: true,
				refundMethod: true,
				createdAt: true,
				updatedAt: true,
			},
			take: 10,
			orderBy: {
				updatedAt: "desc",
			},
		});

		const formattedData: IAdminRefundBookingResponse[] = refund.map((item) => ({
			id: item.id,
			amount: item.amount,
			amountIDR: item.amountIDR,
			percent: item.percent,
			status: item.status,
			refundMethod: item.refundMethod,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		}));

		return formattedData;
	},
	async detail(id: string): Promise<IAdminRefundDetailResponse> {
		const refund = await prisma.refund.findFirst({
			where: {
				id: id,
			},
		});

		if (!refund) throw new ApiError(StatusCodes.NOT_FOUND, "Refund is not found!");

		const formattedData: IAdminRefundDetailResponse = {
			id: refund?.id || "",
			bookingId: refund.bookingId,
			amount: refund.amount,
			amountIDR: refund.amountIDR,
			percent: refund.percent,
			status: refund.status,
			bankName: refund.bankName,
			bankOwner: refund.bankOwner,
			bankNumber: refund.bankNumber,
			price: refund.price,
			reason: refund.reason,
			refundMethod: refund.refundMethod,
			createdAt: refund.createdAt,
			updatedAt: refund.updatedAt,
			processedAt: refund.processedAt,
			processedBy: refund.processedBy,
		};

		return formattedData;
	},

	async action(id: string, action: REFUND_STATUS, accountId: string) {
		const user = await prisma.user.findFirst({
			where: {
				account: {
					id: accountId,
				},
			},
			select: {
				email: true,
			},
		});
		const refund = await prisma.refund.findUnique({
			where: {
				id: id,
			},
		});

		const booking = await prisma.booking.findUnique({
			where: {
				id: refund?.bookingId,
			},
		});

		if (!refund && !booking) throw new ApiError(StatusCodes.NOT_FOUND, "Refund or Booking is not found, please check again!");

		if (refund?.status === action) throw new ApiError(StatusCodes.BAD_REQUEST, `This refund is already ${action}`);

		await prisma.refund.update({
			where: {
				id: refund?.id || id,
			},
			data: {
				status: action,
				processedAt: new Date(),
				processedBy: user?.email,
			},
		});
	},
};
