import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IMemberBookingDetailResponse, IMemberBookingListResponse, IUpcomingBookingResponse } from "./booking.types";

export const bookingService = {
	async account(accountId: string): Promise<{ email: string } | null> {
		return await prisma.account.findUnique({
			where: { id: accountId },
			select: {
				email: true,
			},
		});
	},
	async list(accountId: string): Promise<IMemberBookingListResponse[]> {
		const account = await this.account(accountId);

		const bookingList = await prisma.booking.findMany({
			where: {
				email: account?.email,
				bookingStatus: {
					notIn: ["PENDING", "CANCELLED"],
				},
			},
			select: {
				id: true,
				cruiseTitle: true,
				boatName: true,
				cabinName: true,
				finalPrice: true,
				bookingStatus: true,
				paymentStatus: true,
				paymentType: true,
				totalAdult: true,
				totalChildren: true,
				schedule: {
					select: {
						arrivalAt: true,
						departureAt: true,
						cruise: {
							select: {
								departure: true,
							},
						},
					},
				},
				cabin: {
					select: {
						name: true,
						type: true,
					},
				},
				createdAt: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 10,
		});

		const formatedData: IMemberBookingListResponse[] = bookingList.map((data) => ({
			id: data.id,
			cruiseTitle: data.cruiseTitle,
			boatName: data.boatName,
			cabinName: data.cabinName,
			adults: data.totalAdult,
			children: data.totalChildren,
			bookingStatus: data.bookingStatus,
			finalPrice: data.finalPrice,
			paymentStatus: data.paymentStatus,
			paymentType: data.paymentType as string,
			schedule: {
				arrivalAt: data.schedule.arrivalAt,
				departureAt: data.schedule.departureAt,
				departure: data.schedule.cruise.departure || "",
			},
			createdAt: data.createdAt,
		}));
		return formatedData;
	},

	async detail(accountId: string, bookingId: string): Promise<IMemberBookingDetailResponse> {
		const account = await this.account(accountId);
		const booking = await prisma.booking.findUnique({
			where: {
				id: bookingId,
				email: account?.email,
			},
			select: {
				id: true,
				email: true,
				bookingStatus: true,
				paymentStatus: true,
				paymentType: true,
				cruiseTitle: true,
				boatName: true,
				cabinName: true,
				amountPayment: true,
				amountPaymentIDR: true,
				balancePayment: true,
				balancePaymentIDR: true,
				subTotalPrice: true,
				discount: true,
				finalPrice: true,
				createdAt: true,
				updatedAt: true,
				paidAt: true,
				confirmedAt: true,
				bookingAddons: {
					select: {
						addon: {
							select: {
								title: true,
								price: true,
							},
						},
						qty: true,
						totalPrice: true,
					},
				},
				bookingGuests: {
					select: {
						guest: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
								phone: true,
								identityNumber: true,
								document: true,
								type: true,
								country: true,
							},
						},
						price: true,
					},
				},
				transactions: {
					select: {
						id: true,
						email: true,
						amount: true,
						amountIDR: true,
						status: true,
						notes: true,
						createdAt: true,
						updatedAt: true,
						processedAt: true,
					},
				},
				cabin: {
					select: {
						name: true,
						type: true,
					},
				},
				refunds: {
					select: {
						id: true,
					},
					take: 1,
					orderBy: {
						updatedAt: "desc",
					},
				},
			},
		});

		let refund = null;
		if (booking?.refunds.length !== 0) {
			refund = await prisma.refund.findFirst({
				where: {
					id: booking?.refunds[0].id,
					bookingId: booking?.id,
				},
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
			});
		}

		if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found!");

		const formatedData: IMemberBookingDetailResponse = {
			id: booking.id,
			email: booking.email,
			bookingStatus: booking.bookingStatus,
			paymentStatus: booking.paymentStatus,
			paymentType: booking.paymentType,
			cruiseTitle: booking.cruiseTitle,
			boatName: booking.boatName,
			cabinName: `${booking.cabin.name} - ${booking.cabin.type}`,
			amountPayment: booking.amountPayment,
			amountPaymentIDR: booking.amountPaymentIDR,
			balancePayment: booking.balancePayment,
			balancePaymentIDR: booking.balancePaymentIDR,
			subTotalPrice: booking.subTotalPrice,
			discount: booking.discount,
			finalPrice: booking.finalPrice,

			addons: booking.bookingAddons.map((booking) => ({
				title: booking.addon.title,
				price: booking.addon.price,
				qty: booking.qty,
				totalPrice: booking.totalPrice,
			})),
			guests: booking.bookingGuests.map((guest) => ({
				firstName: guest.guest.firstName,
				lastName: guest.guest.lastName,
				children: guest.guest.type,
				country: guest.guest.country,
				document: guest.guest.document,
				email: guest.guest.email,
				identityNumber: guest.guest.identityNumber,
				phone: guest.guest.phone,
				price: guest.price,
			})),
			transactions: booking.transactions.map((tx) => ({
				id: tx.id,
				email: tx.email,
				amount: tx.amount,
				amountIDR: tx.amountIDR,
				notes: tx.notes,
				createdAt: tx.createdAt,
				updatedAt: tx.updatedAt,
				status: tx.status,
			})),
			createdAt: booking.createdAt,
			updatedAt: booking.updatedAt,
			paidAt: booking.paidAt,
			confirmedAt: booking.confirmedAt,
			refund: refund || null,
		};

		return formatedData;
	},

	async listRefund(accountId: string): Promise<IMemberBookingListResponse[]> {
		const account = await this.account(accountId);

		const bookingList = await prisma.booking.findMany({
			where: {
				email: account?.email,
				bookingStatus: "CANCELLED",
			},
			select: {
				id: true,
				cruiseTitle: true,
				boatName: true,
				cabinName: true,
				finalPrice: true,
				bookingStatus: true,
				paymentStatus: true,
				paymentType: true,
				totalAdult: true,
				totalChildren: true,
				schedule: {
					select: {
						arrivalAt: true,
						departureAt: true,
						cruise: {
							select: {
								departure: true,
							},
						},
					},
				},
				cabin: {
					select: {
						name: true,
						type: true,
					},
				},
				createdAt: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 10,
		});

		const formatedData: IMemberBookingListResponse[] = bookingList.map((data) => ({
			id: data.id,
			cruiseTitle: data.cruiseTitle,
			boatName: data.boatName,
			cabinName: data.cabinName,
			adults: data.totalAdult,
			children: data.totalChildren,
			bookingStatus: data.bookingStatus,
			finalPrice: data.finalPrice,
			paymentStatus: data.paymentStatus,
			paymentType: data.paymentType as string,
			schedule: {
				arrivalAt: data.schedule.arrivalAt,
				departureAt: data.schedule.departureAt,
				departure: data.schedule.cruise.departure || "",
			},
			createdAt: data.createdAt,
		}));
		return formatedData;
	},

	async upcoming(accountId: string): Promise<IUpcomingBookingResponse[]> {
		const account = await this.account(accountId);
		const now = new Date();

		const bookingList = await prisma.booking.findMany({
			where: {
				email: account?.email,
				schedule: {
					arrivalAt: {
						gte: now,
					},
				},
			},
			select: {
				id: true,
				cruiseTitle: true,
				finalPrice: true,
				paymentStatus: true,
				bookingStatus: true,
				schedule: {
					select: {
						arrivalAt: true,
						departureAt: true,
						cruise: {
							select: {
								departure: true,
							},
						},
					},
				},
				createdAt: true,
			},
			orderBy: {
				schedule: {
					departureAt: "asc",
				},
			},
			take: 10,
		});

		const formatedData: IUpcomingBookingResponse[] = bookingList.map((data) => ({
			id: data.id,
			cruiseTitle: data.cruiseTitle,
			finalPrice: data.finalPrice,
			paymentStatus: data.paymentStatus,
			bookingStatus: data.bookingStatus,
			schedule: {
				arrivalAt: data.schedule.arrivalAt,
				departureAt: data.schedule.departureAt,
				departure: data.schedule.cruise.departure || "",
			},
			createdAt: data.createdAt,
		}));

		return formatedData;
	},
};
