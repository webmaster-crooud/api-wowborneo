import { Prisma, TYPECABIN } from "@prisma/client";
import prisma from "../../configs/database";
import { IBookingItineraryResponse, IRepaymentRequest, ITransactionDetailScheduleResponse, ITransactionRequest, ITransactionScheduleResponse } from "../../types/transaction";
import { ApiError } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { getExchangeRate } from "../../utils/exhangeRates";
import { ICartResponse } from "../cart/cart.type";
import { redisClient } from "../../configs/redis";

export const transactionService = {
	// List Schedule
	async list({ cruiseId, month, pax }: { cruiseId?: string; month?: string | Date; pax?: number }): Promise<ITransactionScheduleResponse[]> {
		const now = new Date();
		let year: number | undefined;
		let mon: number | undefined;
		if (month) {
			const m = typeof month === "string" ? new Date(month + "-01") : new Date(month);
			year = m.getFullYear();
			mon = m.getMonth() + 1;
		}
		const result = await prisma.$queryRaw`SELECT DISTINCT
						s.id,
						s.departure_at AS departureAt,
						s.arrival_at AS arrivalAt,
						s.duration_day AS duration,
						s.status,
						c.title as cruiseTitle,
						c.departure,
						b.name as boatName,
						cover.source as cover,
						MIN(cab.price) AS minPrice,
						SUM(cab.max_capacity) as maxCapacity
					FROM schedules s
					JOIN (SELECT title, departure, id FROM river_cruise as c) c ON c.id = s.cruise_id
					JOIN (SELECT id, name FROM boats as b) b ON b.id = s.boat_id
					LEFT JOIN images cover ON
						cover.entity_id = s.cruise_id AND
						cover.entity_type = 'CRUISE' AND
						cover.image_type = 'COVER'
					LEFT JOIN cabins cab ON
						cab.boat_id = b.id AND
						cab.duration = s.duration_day
					WHERE s.departure_at >= ${now}
					AND s.status NOT IN ('PENDING', 'DELETED')
					${cruiseId ? Prisma.sql`AND s.cruise_id = ${cruiseId}` : Prisma.empty}
					${
						year && mon
							? Prisma.sql`
								AND YEAR(s.departure_at)  = ${year}
								AND MONTH(s.departure_at) = ${mon}
							`
							: Prisma.empty
					}
					GROUP BY
						s.id,
						s.departure_at,
						s.arrival_at,
						s.duration_day,
						s.status,
						c.title,
						c.departure,
						b.name,
						cover.source
					${pax ? Prisma.sql`HAVING SUM(cab.max_capacity) >= ${pax}` : Prisma.empty}
					ORDER BY s.updated_at DESC
					LIMIT 10
		`;

		return result;
	},

	// List Cruise
	async listCruise(): Promise<{ id: string; title: string }[]> {
		return await prisma.cruise.findMany({
			where: {
				status: {
					notIn: ["DELETED", "BLOCKED", "PENDING"],
				},
			},
			select: {
				id: true,
				title: true,
			},
		});
	},

	async find(scheduleId: string): Promise<ITransactionDetailScheduleResponse> {
		const countSchedule = await prisma.schedule.count({
			where: { id: scheduleId },
		});
		if (countSchedule === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Schedule is not found!");

		// Hitung dulu jumlah booking
		const countBooking = await prisma.booking.count({
			where: { scheduleId },
		});

		// Kemudian panggil Prisma dengan filter dinamis
		const schedule = await prisma.schedule.findFirst({
			where: { id: scheduleId },
			select: {
				id: true,
				status: true,
				arrivalAt: true,
				departureAt: true,
				cruise: {
					select: { title: true, id: true, departure: true, description: true, duration: true },
				},
				boat: {
					select: {
						id: true,
						name: true,
						deck: { select: { id: true } },
						facilities: {
							select: { name: true, icon: true, description: true },
						},
					},
				},
			},
		});

		// Siapkan filter untuk cabins
		const cabinsFilter = {
			...(countBooking === 0
				? { type: "SUPER" as TYPECABIN } // jika belum ada booking → hanya tipe SUPER
				: { bookings: { none: { scheduleId } } } // jika sudah ada booking → yang belum dipesan
			),
			boatId: schedule.boat.id,
			duration: { equals: Number(schedule.cruise.duration) },
		};
		const cabins = await prisma.cabin.findMany({
			where: cabinsFilter,
			select: {
				id: true,
				name: true,
				maxCapacity: true,
				price: true,
				type: true,
				description: true,
				duration: true,
			},
			orderBy: { price: "desc" },
		});

		const result = {
			...schedule,
			boat: {
				...schedule.boat,
				cabins: cabins
			}
		};

		const coverCruise = await prisma.image.findFirst({
			where: {
				entityId: result?.cruise.id,
				entityType: "CRUISE",
				imageType: "COVER",
			},
			select: {
				source: true,
			},
		});

		const galleriesCruise = await prisma.image.findMany({
			where: {
				entityId: result?.cruise.id,
				entityType: "CRUISE",
				imageType: "PHOTO",
			},
			select: {
				source: true,
			},
		});

		const imageDeck = await prisma.image.findFirst({
			where: {
				entityId: String(result?.boat.id),
				entityType: "DECK",
				imageType: "COVER",
			},
			select: {
				source: true,
			},
		});

		const cabinCovers = await prisma.image.findMany({
			where: {
				entityId: { in: result?.boat.cabins.map((cabin) => String(cabin.id)) },
				entityType: "CABIN",
				imageType: "COVER",
			},
			select: {
				entityId: true,
				source: true,
			},
		});
		// Tambahkan cover ke setiap destination
		const cabinWithCover = result?.boat.cabins.map((cabin) => {
			const cover = cabinCovers.find((cover) => cover.entityId === String(cabin.id));
			return {
				name: cabin.name,
				description: cabin.description,
				maxCapacity: cabin.maxCapacity,
				price: String(cabin.price),
				type: cabin.type,
				id: cabin.id || "",
				cover: cover?.source || "",
			};
		});
		return {
			id: result?.id || "",
			totalBooking: countBooking,
			status: result?.status || "PENDING",
			arrivalAt: result?.arrivalAt || "",
			departureAt: result?.departureAt || "",
			cruise: {
				id: result?.cruise.id || "",
				cover: coverCruise?.source || null,
				departure: result?.cruise.departure || "",
				title: result?.cruise.title || "",
				description: result?.cruise.description || "",
				galleries: galleriesCruise || [],
				duration: Number(result?.cruise.duration) || 0,
			},
			min_price: result ? Math.min(...result.boat.cabins.map((cabin) => Number(cabin.price))) : 0,
			boat: {
				id: result?.boat.id || "",
				name: result?.boat.name || "",
				cabins: cabinWithCover || [],
				facilities:
					result?.boat.facilities.map((facility) => ({
						name: facility.name || "",
						description: facility.description || "",
						icon: facility.icon || "",
					})) || [],
				deck: {
					cover: imageDeck?.source || null,
				},
			},
		};
	},

	async bookingItenerary(scheduleId: string, cabinId: string): Promise<IBookingItineraryResponse> {
		const countSchedule = await prisma.schedule.count({
			where: {
				OR: [
					{ id: scheduleId, status: "ACTIVED" },
					{ id: scheduleId, status: "FAVOURITED" },
				],
			},
		});
		if (countSchedule === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Schedule is not found!");

		const schedule = await prisma.schedule.findFirst({
			where: {
				id: scheduleId,
			},
			select: {
				id: true,
				status: true,
				arrivalAt: true,
				departureAt: true,
				cruise: {
					select: {
						title: true,
						id: true,
						departure: true,
						description: true,
						duration: true,
					},
				},
				boat: {
					select: {
						id: true,
						name: true,
					},
				},
				scheduleAddons: {
					select: {
						addon: {
							select: {
								id: true,
								cover: true,
								description: true,
								price: true,
								title: true,
							},
						},
					},
				},
			},
		});
		const cabin = await prisma.cabin.findUnique({
			where: { id: Number(cabinId) },
		});

		const coverCruise = await prisma.image.findFirst({
			where: {
				entityId: schedule?.cruise.id,
				entityType: "CRUISE",
				imageType: "COVER",
			},
			select: {
				source: true,
			},
		});

		const addonIds = schedule?.scheduleAddons.map(({ addon }) => String(addon.id));
		const coverAddon = await prisma.image.findMany({
			where: {
				entityId: { in: addonIds },
				entityType: "ADDON",
				imageType: "COVER",
			},
			select: {
				entityId: true,
				source: true,
			},
		});
		const coverMapingAddon = new Map(coverAddon.map((cover) => [cover.entityId, cover.source]));
		return {
			id: schedule?.id || "",
			status: schedule?.status || "PENDING",
			arrivalAt: schedule?.arrivalAt || "",
			departureAt: schedule?.departureAt || "",
			cruise: {
				id: schedule?.cruise.id || "",
				cover: coverCruise?.source || null,
				departure: schedule?.cruise.departure || "",
				title: schedule?.cruise.title || "",
				description: schedule?.cruise.description || "",
				duration: Number(schedule?.cruise.duration) || 0,
			},
			boat: {
				name: schedule?.boat.name || "",
				cabin: {
					type: cabin?.type || "TWIN",
					maxCapacity: cabin?.maxCapacity || 1,
					price: cabin?.price.toString() || "",
				},
			},
			addons: (schedule?.scheduleAddons || []).map(({ addon }) => ({
				cover: coverMapingAddon.get(String(addon.id)) || null,
				id: addon.id,
				description: addon.description,
				price: addon.price.toString(),
				title: addon.title,
			})),
		};
	},
	async countAdultsAndChildren(transaction: ICartResponse) {
		// Pastikan guests tersedia (tidak undefined atau null)
		const guests = transaction.guests || [];

		// Hitung jumlah adult dan children
		const adults = guests.filter((guest) => !guest.children).length;
		const children = guests.filter((guest) => guest.children).length;

		return { adults, children };
	},
	async transaction(body: ICartResponse, code: string) {
		const cabin = await prisma.cabin.findUnique({
			where: {
				id: Number(body.cabinId),
			},
			select: {
				id: true,
				name: true,
				type: true,
				boat: {
					select: {
						name: true,
					},
				},
			},
		});

		const exchangeRateConcurrency = await getExchangeRate();
		if (!cabin) throw new ApiError(StatusCodes.NOT_FOUND, "Cabin is not found");
		const { adults, children } = await this.countAdultsAndChildren(body);
		await prisma.$transaction(async (tx) => {
			const booking = await tx.booking.create({
				data: {
					id: code,
					email: body.email,
					cabinId: cabin?.id,
					scheduleId: body.scheduleId,

					taxRate: 0,
					taxAmount: 0,
					amountPayment: body.amountPayment || "",
					amountPaymentIDR: Math.floor(Number(body.amountPayment) * exchangeRateConcurrency),
					balancePayment: body.amountUnderPayment,
					balancePaymentIDR: Math.floor(Number(body.amountUnderPayment) * exchangeRateConcurrency),
					subTotalPrice: body.subTotal || "",
					discount: 0,
					finalPrice: body.finalTotal || "",

					bookingStatus: "PENDING",
					paymentStatus: "PENDING",
					paymentType: body.method === "dp" ? "Down Payment" : "Full Payment",
					paymentMethod: "DOKU",
					referenceCode: code,
					totalAdult: adults,
					totalChildren: children,

					cruiseTitle: body.cruise.title,
					boatName: cabin.boat.name,
					cabinName: cabin?.type || cabin?.name || "",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				include: {
					account: {
						select: {
							email: true,
						},
					},
				},
			});
			await tx.transaction.create({
				data: {
					bookingId: booking.id,
					amount: body.amountPayment || "",
					amountIDR: Number(body.amountPayment) * exchangeRateConcurrency,
					email: body.email || booking.account.email,
					paymentMethod: booking.paymentMethod || body.method || "full",
					referenceCode: booking.referenceCode,
					status: "PENDING",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			await Promise.all(
				body.addons?.map((addon) =>
					tx.bookingAddon.create({
						data: {
							bookingId: booking.id,
							addonId: addon.id,
							qty: addon.qty,
							totalPrice: addon.totalPrice,
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					})
				) || []
			);

			await Promise.all(
				body.guests?.map(async (guest) => {
					try {
						// Upsert guest dengan update data
						const upsertedGuest = await tx.guest.upsert({
							where: { email: guest.email },
							update: {
								firstName: guest.firstName,
								lastName: guest.lastName,
								phone: guest.phone,
								country: guest.country,
							},
							create: {
								firstName: guest.firstName,
								lastName: guest.lastName,
								country: guest.country,
								email: guest.email,
								identityNumber: guest.identityNumber,
								phone: guest.phone,
								document: guest.document,
								type: guest.children ? "CHILD" : "ADULT",
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						});

						// Create booking guest relation
						return tx.bookingGuest.create({
							data: {
								bookingId: booking.id,
								guestId: upsertedGuest.id,
								price: guest.price,
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						});
					} catch (error) {
						if ((error as any).code === "P2002") {
							// Cek pesan error dari database
							const message = (error as any).message.includes("identityNumber") ? `Identity Number ${guest.identityNumber} sudah terdaftar` : `Email ${guest.email} sudah terdaftar`;

							throw new ApiError(400, message);
						}
					}
				}) || []
			);
		});
	},

	async repayment(body: IRepaymentRequest, code: string, referenceCode: string) {
		const exchangeRateConcurrency = await getExchangeRate();
		await prisma.$transaction(async (tx) => {
			const booking = await tx.booking.update({
				where: {
					id: code,
				},
				data: {
					paymentStatus: "PENDING",
					updatedAt: new Date(),
				},
				include: {
					account: {
						select: {
							email: true,
						},
					},
				},
			});
			await tx.transaction.create({
				data: {
					bookingId: booking.id,
					amount: body.amountPayment,
					amountIDR: Number(body.amountPayment) * exchangeRateConcurrency,
					email: body.email || booking.account.email,
					paymentMethod: "full",
					referenceCode: referenceCode,
					status: "PENDING",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
		});
	},

	async successPayment(code: string) {
		const findBooking = await prisma.booking.findUnique({
			where: {
				id: code,
			},
			select: {
				id: true,
				paymentStatus: true,
				paymentType: true,
				bookingStatus: true,
				amountPayment: true,
				amountPaymentIDR: true,
				balancePayment: true,
				balancePaymentIDR: true,
				account: {
					select: {
						id: true,
					},
				},
				scheduleId: true,
				transactions: {
					where: { status: "PENDING" },
					orderBy: { createdAt: "desc" },
					take: 1, // Ambil hanya 1 transaksi terbaru
				},
			},
		});

		if (!findBooking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found!");
		const key = `transaction:${findBooking.scheduleId}:${findBooking.account.id}`;
		await redisClient.del(key);

		if (findBooking.bookingStatus === "DOWNPAYMENT") {
			if (!findBooking.transactions.length) {
				throw new ApiError(StatusCodes.NOT_FOUND, "No pending transaction found");
			}
			const pendingTransaction = findBooking.transactions[0];

			try {
				await prisma.$transaction(async (tx) => {
					const amountPayment = Math.floor(Number(findBooking.amountPayment) + Number(findBooking.balancePayment));
					const amountPaymentIDR = Math.floor(Number(findBooking.amountPaymentIDR) + Number(findBooking.balancePaymentIDR));
					await tx.booking.update({
						where: {
							id: findBooking.id,
						},
						data: {
							amountPayment: amountPayment,
							amountPaymentIDR: amountPaymentIDR,
							balancePayment: 0,
							balancePaymentIDR: 0,
							paymentType: "Full Payment",
							paymentStatus: "SUCCESS",
							bookingStatus: "DONE",
							notes: "Full Payment Successfully",
							updatedAt: new Date(),
							paidAt: new Date(),

							transactions: {
								update: {
									where: {
										id: pendingTransaction.id,
										bookingId: code,
										status: "PENDING",
									},
									data: {
										notes: "Full Payment Successfully",
										status: "SUCCESS",
										updatedAt: new Date(),
										processedAt: new Date(),
									},
								},
							},
						},
					});
				});
			} catch (error) {
				console.error("Update failed:", error);
				throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update booking status");
			}
		} else {
			if (findBooking.bookingStatus !== "PENDING" && findBooking.paymentStatus !== "PENDING") throw new ApiError(StatusCodes.BAD_REQUEST, "Payment process is failed, please contact us!");
			await prisma.$transaction(async (tx) => {
				await tx.booking.update({
					where: {
						id: code,
					},
					data: {
						paymentStatus: "SUCCESS",
						bookingStatus: findBooking.paymentType === "Down Payment" ? "DOWNPAYMENT" : findBooking.paymentType === "Full Payment" ? "DONE" : "CANCELLED",
						notes: findBooking.paymentType === "Down Payment" ? "Down Payment Successfully" : findBooking.paymentType === "Full Payment" ? "Full Payment Successfully" : "Payment Cancel",
						updatedAt: new Date(),

						transactions: {
							update: {
								where: {
									id: findBooking.transactions[0].id,
									booking: {
										id: code,
									},
									status: "PENDING",
									referenceCode: code,
								},
								data: {
									notes: findBooking.paymentType === "Down Payment" ? "Down Payment Successfully" : findBooking.paymentType === "Full Payment" ? "Full Payment Successfully" : "Payment Cancel",
									status: "SUCCESS",
									updatedAt: new Date(),
									processedAt: new Date(),
								},
							},
						},
					},
				});
			});
		}
	},
};
