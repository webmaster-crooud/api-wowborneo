import { Prisma } from "@prisma/client";
import prisma from "../../configs/database";
import { IBookingItineraryResponse, IRepaymentRequest, ITransactionDetailScheduleResponse, ITransactionRequest, ITransactionScheduleResponse } from "../../types/transaction";
import { ApiError } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { getExchangeRate } from "./transaction.controller";

export const transactionService = {
	async list(filters: { search?: string; date?: Date; cruiseId?: string; pax?: number }): Promise<ITransactionScheduleResponse[]> {
		const whereClause: Prisma.ScheduleWhereInput = {
			AND: [
				{ id: { contains: filters.search || undefined } },
				filters.date
					? {
							departureAt: { lte: filters.date },
							arrivalAt: { gte: filters.date },
						}
					: {},
				filters.cruiseId ? { cruiseId: filters.cruiseId } : {},
				{
					boat: { status: { notIn: ["DELETED", "PENDING"] } },
					cruise: { status: { notIn: ["DELETED", "PENDING"] } },
					// Tambahkan filter status untuk mengecualikan DELETED dan PENDING
					status: {
						notIn: ["DELETED", "PENDING"], // <-- MODIFIKASI DI SINI
					},
				},
			],
		};

		const schedules = await prisma.schedule.findMany({
			where: whereClause,
			include: {
				boat: {
					select: {
						name: true,
						cabins: {
							select: {
								id: true,
								maxCapacity: true,
								price: true,
							},
						},
					},
				},
				cruise: {
					select: {
						id: true,
						title: true,
						departure: true,
						duration: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: 10,
		});

		// 2. Ambil semua ID cabin dan schedule untuk query booking
		const cabinIds = schedules.flatMap((s) => s.boat.cabins.map((c) => c.id));
		const scheduleIds = schedules.map((s) => s.id);

		// 2. Ambil semua ID cruise untuk query gambar
		const cruiseIds = schedules.map((s) => s.cruise.id);

		// 3. Ambil semua cover cruise sekaligus
		const cruiseCovers = await prisma.image.findMany({
			where: {
				entityId: { in: cruiseIds },
				entityType: "CRUISE",
				imageType: "COVER",
			},
			select: {
				entityId: true,
				source: true,
			},
		});
		// 3. Hitung booking yang sukses per cabin dan schedule
		const bookings = await prisma.booking.groupBy({
			by: ["scheduleId", "cabinId"],
			where: {
				scheduleId: { in: scheduleIds },
				cabinId: { in: cabinIds },
				paymentStatus: "SUCCESS",
			},
			_count: true,
		});

		// 4. Buat mapping untuk akses cepat
		const bookingCountMap = new Map();
		bookings.forEach((b) => {
			const key = `${b.scheduleId}-${b.cabinId}`;
			bookingCountMap.set(key, b._count);
		});

		// 4. Buat mapping ID cruise -> cover
		const coverMap = new Map(cruiseCovers.map((cover) => [cover.entityId, cover.source]));

		// 5. Format data response
		const formattedData: ITransactionScheduleResponse[] = schedules.map((item) => {
			// Hitung total kapasitas dan booking
			const totalCapacity = item.boat.cabins.reduce((sum, cabin) => sum + Number(cabin.maxCapacity), 0);

			const totalBooked = item.boat.cabins.reduce((sum, cabin) => {
				const key = `${item.id}-${cabin.id}`;
				return sum + (bookingCountMap.get(key) || 0);
			}, 0);

			// Cari harga termurah
			const minPrice = Math.min(...item.boat.cabins.map((cabin) => Number(cabin.price)));

			return {
				id: item.id,
				departureAt: item.departureAt,
				arrivalAt: item.arrivalAt,
				boatTitle: item.boat.name,
				cruiseTitle: item.cruise.title,
				departure: item.cruise.departure || "",
				status: item.status,
				min_price: minPrice,
				availableCabin: totalCapacity - totalBooked,
				bookedCabin: totalBooked,
				duration: Number(item.cruise.duration),
				cover: coverMap.get(item.cruise.id) || null, // Tambahkan cover dari mapping
			};
		});

		// Filter berdasarkan PAX
		let filteredData = formattedData;
		if (filters.pax) {
			filteredData = formattedData.filter((schedule) => schedule.availableCabin >= (filters.pax || 0));
		}

		return filteredData;
	},
	async find(scheduleId: string): Promise<ITransactionDetailScheduleResponse> {
		const countSchedule = await prisma.schedule.count({
			where: { id: scheduleId },
		});
		if (countSchedule === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Schedule is not found!");

		const result = await prisma.schedule.findFirst({
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
						deck: {
							select: {
								id: true,
							},
						},
						facilities: {
							select: {
								name: true,
								icon: true,
								description: true,
							},
						},
						cabins: {
							where: {
								bookings: {
									none: {
										scheduleId: scheduleId,
									},
								},
							},
							select: {
								id: true,
								name: true,
								maxCapacity: true,
								price: true,
								type: true,
								description: true,
							},
							orderBy: {
								price: "desc",
							},
						},
					},
				},
			},
		});

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
				id: true,
				entityId: true,
				entityType: true,
				imageType: true,
				source: true,
				alt: true,
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
	async countAdultsAndChildren(transaction: ITransactionRequest) {
		// Pastikan guests tersedia (tidak undefined atau null)
		const guests = transaction.guests || [];

		// Hitung jumlah adult dan children
		const adults = guests.filter((guest) => !guest.children).length;
		const children = guests.filter((guest) => guest.children).length;

		return { adults, children };
	},
	async transaction(body: ITransactionRequest, code: string) {
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
					amountPayment: body.amountPayment,
					amountPaymentIDR: Math.floor(Number(body.amountPayment) * exchangeRateConcurrency),
					balancePayment: body.amountUnderPayment,
					balancePaymentIDR: Math.floor(Number(body.amountUnderPayment) * exchangeRateConcurrency),
					subTotalPrice: body.subTotal,
					discount: 0,
					finalPrice: body.finalTotal,

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
					amount: body.amountPayment,
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
				body.addons.map((addon) =>
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
				)
			);

			await Promise.all(
				body.guests.map(async (guest) => {
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
				})
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
				transactions: {
					where: { status: "PENDING" },
					orderBy: { createdAt: "desc" },
					take: 1, // Ambil hanya 1 transaksi terbaru
				},
			},
		});

		console.log(code);
		console.log(findBooking);
		if (!findBooking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking is not found!");
		if (findBooking.bookingStatus === "DOWNPAYMENT") {
			if (!findBooking.transactions.length) {
				throw new ApiError(StatusCodes.NOT_FOUND, "No pending transaction found");
			}
			const pendingTransaction = findBooking.transactions[0];
			console.log(pendingTransaction);
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
