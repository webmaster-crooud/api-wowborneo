import { TYPECABIN } from "@prisma/client";
import prisma from "../../../configs/database";
import { IAdminBookingListResponse } from "./booking.type";
import { ApiError } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { IMemberBookingDetailResponse } from "../../member/booking/booking.types";

const bookingService = {
	async account(email: string): Promise<{ email: string } | null> {
		return await prisma.account.findUnique({
			where: { email: email },
			select: {
				email: true,
			},
		});
	},
	async list(): Promise<IAdminBookingListResponse[]> {
		const booking = await prisma.booking.findMany({
			where: {
				bookingStatus: {
					notIn: ["CANCELLED", "PENDING"],
				},
			},
			select: {
				id: true,
				email: true,
				bookingStatus: true,
				paymentStatus: true,
				paymentType: true,
				finalPrice: true,
				totalAdult: true,
				totalChildren: true,
				cabinName: true,
				boatName: true,
				cruiseTitle: true,
				schedule: {
					select: {
						departureAt: true,
						arrivalAt: true,
						cruise: {
							select: {
								id: true,
								title: true,
								departure: true,
							},
						},
						boat: {
							select: {
								name: true,
								id: true,
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
			},
			take: 10,
			orderBy: {
				updatedAt: "desc",
			},
		});

		const formatedData: IAdminBookingListResponse[] = booking.map((item) => ({
			id: item.id,
			email: item.email,
			bookingStatus: item.bookingStatus,
			paymentStatus: item.paymentStatus,
			paymentType: item.paymentType || "",
			finalPrice: item.finalPrice,
			adults: item.totalAdult,
			children: item.totalChildren,
			schedule: {
				arrivalAt: item.schedule.arrivalAt,
				departureAt: item.schedule.departureAt,
			},
			cruise: {
				id: item.schedule.cruise.id,
				title: item.cruiseTitle,
				departure: item.schedule.cruise.departure || "",
			},
			boat: {
				id: item.schedule.boat.id,
				name: item.boatName,
			},
			cabin: {
				name: item.cabin.name,
				type: item.cabinName as TYPECABIN,
			},
		}));

		return formatedData;
	},
	async detail(bookingId: string): Promise<IMemberBookingDetailResponse> {
		const booking = await prisma.booking.findUnique({
			where: {
				id: bookingId,
				paymentStatus: "SUCCESS",
				bookingStatus: {
					notIn: ["CANCELLED", "PENDING"],
				},
			},
			select: {
				id: true,
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
				email: true,
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
			},
		});

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
		};
		return formatedData;
	},

	async confirmed(bookingId: string, email: string, accountId: string) {
		const account = await this.account(email);
		const booking = await prisma.booking.count({
			where: {
				id: bookingId,
				email: account?.email || "",
				bookingStatus: {
					notIn: ["COMPLETED", "CHECKIN", "CONFIRMED"],
				},
			},
		});

		if (booking !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found or already completed");
		await prisma.booking.update({
			where: {
				id: bookingId,
			},
			data: {
				paymentStatus: "SUCCESS",
				bookingStatus: "CONFIRMED",
				confirmedAt: new Date(),
				confirmedBy: accountId,
				updatedAt: new Date(),
			},
		});
	},

	async checkin(bookingId: string) {
		const booking = await prisma.booking.findUnique({
			where: {
				id: bookingId,
				bookingStatus: {
					notIn: ["COMPLETED", "CHECKIN"],
				},
			},
			select: {
				bookingStatus: true,
			},
		});

		if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found or already completed");
		if (booking.bookingStatus !== "CONFIRMED") throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is not already confirmed, Please make sure confirmation this booking!");
		const result = await prisma.booking.update({
			where: {
				id: bookingId,
				bookingStatus: "CONFIRMED",
			},
			data: {
				bookingStatus: "CHECKIN",
				updatedAt: new Date(),
			},
		});

		if (!result) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found or already checkin");
	},

	async completed(scheduleId: string) {
		// 1. Cek apakah schedule exists
		const scheduleExists = await prisma.schedule.findUnique({
			where: { id: scheduleId },
		});

		if (!scheduleExists) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Schedule not found");
		}

		// 2. Update semua booking dengan status CHECKIN
		await prisma.booking.updateMany({
			where: {
				scheduleId: scheduleId,
				bookingStatus: "CHECKIN",
			},
			data: {
				bookingStatus: "COMPLETED",
			},
		});
	},
};

export default bookingService;
