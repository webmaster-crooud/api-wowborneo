import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IBoatRequestBody, IDetailBoatResponse, IListBoatResponse, IUpdateBoatRequest } from "../../../types/boat";
import slugify from "slugify";
import { STATUS } from "@prisma/client";

export const boatService = {
	async create(accountId: string, body: IBoatRequestBody) {
		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
			},
			select: {
				role: { select: { name: true } },
			},
		});

		const slug = slugify(body.slug ? body.slug.toLocaleLowerCase() : body.name.toLocaleLowerCase());
		const countBoat = await prisma.boat.count({
			where: {
				slug: slug,
			},
		});

		if (countBoat !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, `${body.name} is already exist, please check your input!`);

		const result = await prisma.$transaction(async (tx) => {
			try {
				const boat = await tx.boat.create({
					data: {
						name: body.name,
						slug,
						description: body.description,
						status: !body.status ? (account?.role.name === "admin" ? "PENDING" : "ACTIVED") : body.status,
						createdAt: new Date(),
						updatedAt: new Date(),
						optionText: body.optionText,
						cruise: {
							connect: {
								id: body.cruiseId,
							},
						},
						deck: {
							create: {
								title: body.deck.title,
								description: body.deck.description,
							},
						},
					},
					select: {
						id: true,
						deck: {
							select: {
								id: true,
							},
						},
					},
				});

				await Promise.all(
					body.abouts.map((about) =>
						tx.about.create({
							data: {
								title: about.title,
								description: about.description,
								boat: {
									connect: {
										id: boat.id,
									},
								},
							},
						})
					)
				);

				const experiencePromise = await Promise.all(
					body.experiences.map((experience) =>
						tx.experience.create({
							data: {
								title: experience.title,
								description: experience.description,
								boat: {
									connect: {
										id: boat.id,
									},
								},
							},
						})
					)
				);
				const experiences = await Promise.all(experiencePromise);
				const experiencesId = experiences.map((exp) => exp.id);

				await Promise.all(
					body.facilities.map((facility) =>
						tx.facility.create({
							data: {
								name: facility.name,
								description: facility.description,
								icon: facility.icon,
								boat: {
									connect: {
										id: boat.id,
									},
								},
							},
						})
					)
				);

				const cabinsPromise = await Promise.all(
					body.cabins.map((cabin) =>
						tx.cabin.create({
							data: {
								name: cabin.name,
								description: cabin.description,
								maxCapacity: cabin.maxCapacity,
								price: cabin.price,
								type: cabin.type,
								boat: {
									connect: {
										id: boat.id,
									},
								},
							},
						})
					)
				);
				const cabins = await Promise.all(cabinsPromise);
				const cabinsId = cabins.map((cabin) => cabin.id);

				return { boat, cabinsId, experiencesId };
			} catch (error) {
				// Tangani error berdasarkan kode error Prisma
				if ((error as any).code === "P2002") {
					// Unique constraint violation
					const targetField = (error as any).meta?.target?.[0];
					throw new ApiError(StatusCodes.BAD_REQUEST, `Data with the same ${targetField || "field"} already exists! Please check your input.`);
				} else if ((error as any).code === "P2003") {
					// Foreign key constraint violation
					throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid reference: Related data not found!");
				} else {
					// Error lainnya
					throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to process create data");
				}
			}
		});

		return result;
	},
	async get(
		s?: string, // Search term
		f: boolean = false, // Sort order flag for updatedAt (false = descending, true = ascending)
		fav: boolean = false, // Extra favorite filter flag
		deleted: boolean = false // Show deleted items flag
	): Promise<IListBoatResponse[]> {
		// Build the base filter
		const filter: any = {};

		// Add search condition if provided
		if (s) {
			filter.name = { contains: s };
		}

		// Handle status filtering
		if (deleted) {
			// When deleted is true, only show DELETED items
			filter.status = "DELETED";
		} else {
			// Default view excludes deleted items
			filter.status = {
				not: "DELETED",
			};
		}

		// Build the orderBy object to control sorting
		let orderBy: any = {};

		// If favorite prioritization is requested, sort by status first (putting FAVOURITED on top)
		if (fav) {
			orderBy = [
				// This puts FAVOURITED status first
				{
					status: {
						// Custom sort order: FAVOURITED first, then others
						sort: {
							FAVOURITED: 0,
							_: 1, // All other statuses
						},
					},
				},
				// Then apply the requested date sorting
				{ updatedAt: f ? "asc" : "desc" },
			];
		} else {
			// Just use the date sorting if no favorite prioritization
			orderBy = { updatedAt: f ? "asc" : "desc" };
		}

		// Perform the database query
		const result = await prisma.boat.findMany({
			where: filter,
			select: {
				id: true,
				name: true,
				slug: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				cruise: {
					select: {
						title: true,
						id: true,
					},
				},
			},
			orderBy: orderBy,
			take: 10,
		});

		return result;
	},
	async find(boatId: string): Promise<IDetailBoatResponse> {
		// Pertama kita ambil data cruise beserta relasi
		const boat = await prisma.boat.findUnique({
			where: {
				id: boatId,
				AND: [
					{
						NOT: {
							status: "DELETED",
						},
					},
				],
			},
			include: {
				abouts: true,
				cabins: true,
				cruise: true,
				deck: true,
				experiences: true,
				facilities: true,
			},
		});

		if (!boat) throw new ApiError(StatusCodes.NOT_FOUND, "Boat is not found!");

		// Ambil cover cruise
		const boatCover = await prisma.image.findFirst({
			where: {
				entityId: String(boat.id),
				entityType: "BOAT",
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
		const deckCover = await prisma.image.findFirst({
			where: {
				entityId: String(boat.id),
				entityType: "DECK",
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

		// Ambil semua gambar cover untuk destinations
		const cabinCovers = await prisma.image.findMany({
			where: {
				entityId: { in: boat.cabins.map((cabin) => String(cabin.id)) },
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

		// Ambil semua gambar cover untuk highlights
		const experienceCover = await prisma.image.findMany({
			where: {
				entityId: { in: boat.experiences.map((exp) => String(exp.id)) },
				entityType: "EXPERIENCE",
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
		const cabinWithCover = boat.cabins.map((cabin) => {
			const cover = cabinCovers.find((cover) => cover.entityId === String(cabin.id));
			return {
				...cabin,
				cover: cover || null,
			};
		});

		// Tambahkan cover ke setiap highlight
		const experienceWithCover = boat.experiences.map((experience) => {
			const cover = experienceCover.find((cover) => cover.entityId === String(experience.id));
			return {
				...experience,
				cover: cover || null,
			};
		});

		// Kembalikan data cruise yang sudah dilengkapi dengan cover dan gallery
		return {
			...boat,
			cover: boatCover || null,
			deck: {
				id: boat.deck?.id || "",
				description: boat.deck?.description || "",
				title: boat.deck?.title || "",
				cover: deckCover || null,
			},

			cabins: cabinWithCover,
			experiences: experienceWithCover,
		};
	},

	async update(boatId: string, body: IUpdateBoatRequest) {
		const countBoat = await prisma.boat.count({
			where: {
				id: boatId,
			},
		});

		if (countBoat === 0) throw new ApiError(StatusCodes.NOT_FOUND, "This boat is not found!");
		else
			await prisma.boat.update({
				where: {
					id: boatId,
					status: {
						not: "DELETED",
					},
				},
				data: {
					name: body.name,
					cruise: {
						connect: {
							id: body.cruiseId,
						},
					},
					description: body.description,
					optionText: body.optionText,
					updatedAt: new Date(),
				},
			});
	},
	async action(action: STATUS, id: string, accountId: string): Promise<{ name: string; status: STATUS }> {
		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
			},
			select: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});
		const boat = await prisma.boat.findUnique({
			where: {
				id,
			},
			select: {
				status: true,
				name: true,
			},
		});
		if (boat?.status === "PENDING") {
			if (account?.role.name !== "admin" && action === "ACTIVED") throw new ApiError(StatusCodes.FORBIDDEN, "Oppss... Your account can't access this service");
		}
		if (boat?.status === action) throw new ApiError(StatusCodes.OK, `${boat.name} has already ${boat.status}`);
		else
			return await prisma.boat.update({
				where: {
					id,
				},
				data: {
					status: action,
					updatedAt: new Date(),
				},
				select: {
					name: true,
					status: true,
				},
			});
	},
};
