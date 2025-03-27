import { IDetailScheduleResponse, IListScheduleResponse, IScheduleRequestBody } from "../../../types/schedule";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { Prisma, STATUS } from "@prisma/client";

export type GetCruisesResponse = IListScheduleResponse[];
export const scheduleService = {
	async create(accountId: string, body: IScheduleRequestBody) {
		const departureAt = new Date(body.departureAt);
		const startOfDay = new Date(departureAt);
		startOfDay.setUTCHours(0, 0, 0, 0); // Start of day in UTC
		const endOfDay = new Date(startOfDay);
		endOfDay.setUTCDate(startOfDay.getUTCDate() + 1); // Start of next day

		// 2. Check for existing schedules within the same day
		const countCruise = await prisma.schedule.count({
			where: {
				cruise: { id: body.cruiseId },
				departureAt: {
					gte: startOfDay, // Greater than or equal to start of day
					lt: endOfDay, // Less than next day
				},
			},
		});

		if (countCruise > 0) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Cruise already exists for this date");
		}

		// 3. Ambil durasi Cruise
		const cruise = await prisma.cruise.findUnique({
			where: { id: body.cruiseId },
			select: { id: true, duration: true },
		});

		if (!cruise) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Cruise not found");
		}

		// 4. Ambil role account
		const account = await prisma.account.findUnique({
			where: { id: accountId },
			select: { role: { select: { name: true } } },
		});

		// 5. Hitung arrivalAt
		const durationDays = parseInt(cruise.duration) || 0;
		const arrivalDate = new Date(departureAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
		const formattedArrivalAt = arrivalDate.toISOString(); // Keep full ISO string

		// 6. Buat Schedule
		await prisma.schedule.create({
			data: {
				cruise: { connect: { id: cruise.id } },
				status: !body.status ? (account?.role?.name === "admin" ? STATUS.PENDING : STATUS.ACTIVED) : (body.status as STATUS),
				departureAt: departureAt, // Direct Date object or ISO string
				arrivalAt: formattedArrivalAt, // Full ISO-8601 string
				createdAt: new Date(),
				updatedAt: new Date(),
				boat: {
					connect: {
						id: body.boatId,
					},
				},
			},
		});
	},

	async list(filters: { search?: string; date?: Date; cruiseId?: string; pax?: number }): Promise<GetCruisesResponse> {
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
					boat: { status: { not: "DELETED" } },
					cruise: { status: { not: "DELETED" } },
					status: { not: "DELETED" },
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
		const formattedData: IListScheduleResponse[] = schedules.map((item) => {
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

	async find(scheduleId: string): Promise<IDetailScheduleResponse> {
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
						cabins: {
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
			},
			boat: {
				id: result?.boat.id || "",
				name: result?.boat.name || "",
				cabins:
					result?.boat.cabins?.map((cabin) => ({
						name: cabin.name,
						description: cabin.description,
						maxCapacity: cabin.maxCapacity,
						price: String(cabin.price),
						type: cabin.type,
						id: cabin.id || "",
					})) || [],
				deck: {
					cover: imageDeck?.source || null,
				},
			},
		};
	},

	async action(scheduleId: string, action: STATUS) {
		const countSchedule = await prisma.schedule.count({
			where: { id: scheduleId },
		});
		if (countSchedule === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Schedule is not found!");

		return await prisma.schedule.update({
			where: {
				id: scheduleId,
			},
			data: {
				status: action,
				updatedAt: new Date(),
			},
			select: {
				status: true,
			},
		});
	},
	async update(scheduleId: string, body: IScheduleRequestBody) {
		const departureAt = new Date(body.departureAt);
		const startOfDay = new Date(departureAt);
		startOfDay.setUTCHours(0, 0, 0, 0); // Start of day in UTC
		const endOfDay = new Date(startOfDay);
		endOfDay.setUTCDate(startOfDay.getUTCDate() + 1); // Start of next day

		// 2. Check for existing schedules within the same day
		const countCruise = await prisma.schedule.count({
			where: {
				cruise: { id: body.cruiseId },
				departureAt: {
					gte: startOfDay, // Greater than or equal to start of day
					lt: endOfDay, // Less than next day
				},
			},
		});

		if (countCruise > 0) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Cruise already exists for this date");
		}

		// 3. Ambil durasi Cruise
		const cruise = await prisma.cruise.findUnique({
			where: { id: body.cruiseId },
			select: { id: true, duration: true },
		});

		if (!cruise) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Cruise not found");
		}

		// 5. Hitung arrivalAt
		const durationDays = parseInt(cruise.duration) || 0;
		const arrivalDate = new Date(departureAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
		const formattedArrivalAt = arrivalDate.toISOString(); // Keep full ISO string

		// 6. Buat Schedule
		await prisma.schedule.update({
			where: {
				id: scheduleId,
			},
			data: {
				cruise: { connect: { id: cruise.id } },
				departureAt: departureAt, // Direct Date object or ISO string
				arrivalAt: formattedArrivalAt, // Full ISO-8601 string
				updatedAt: new Date(),
				boat: {
					connect: {
						id: body.boatId,
					},
				},
			},
		});
	},

	async listDeleted(): Promise<GetCruisesResponse> {
		// 1. Ambil data schedule dengan relasi
		const schedules = await prisma.schedule.findMany({
			where: {
				status: "DELETED",
			},
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
		const formattedData: IListScheduleResponse[] = schedules.map((item) => {
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
				cover: coverMap.get(item.cruise.id) || null, // Tambahkan cover dari mapping
			};
		});

		return formattedData;
	},
};
