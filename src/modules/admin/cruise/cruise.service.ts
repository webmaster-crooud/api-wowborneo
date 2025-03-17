import slugify from "slugify";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../types/main";
import { ICruise, ICruises } from "../../../types/cruise";
import { any, promise } from "zod";

/* 
notes:
s = search
f = filter;
*/

export const cruiseService = {
	async countId(id: string): Promise<number> {
		const count = await prisma.cruise.count({
			where: { id, NOT: { status: "DELETED" } },
		});
		return count;
	},
	async countCruise(title: string, slug: string): Promise<number> {
		const countCruise = await prisma.cruise.count({
			where: {
				title: title,
				slug: slug,
			},
		});
		return countCruise;
	},

	async create(accountId: string, body: ICruise): Promise<{ id: string; status: STATUS; destinationIds: number[]; highlightIds: number[] }> {
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
		const slug: string = slugify(body.title);

		const count = await this.countCruise(body.title, slug);
		if (count !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Cruise title or slug has already in database, please check your input again!");

		const result = await prisma.$transaction(async (tx) => {
			try {
				// Buat cruise
				const cruise = await tx.cruise.create({
					data: {
						title: body.title,
						slug,
						subTitle: body.subTitle,
						duration: body.duration || "",
						departure: body.departure,
						description: body.description,
						introductionTitle: body.introductionTitle,
						introductionText: body.introductionText,
						cta: body.cta,
						status: account?.role.name === "admin" ? "PENDING" : "ACTIVED",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					select: {
						id: true,
						status: true,
					},
				});

				const destinationsPromise = await Promise.all(
					body.destinations.map((data) =>
						tx.destination.create({
							data: {
								cruiseId: cruise.id,
								title: data.title,
								description: data.description,
								days: data.days || "",
								status: cruise.status,
								createdAt: new Date(),
								updatedAt: new Date(),
							},
							select: {
								id: true,
							},
						})
					)
				);

				const destinations = await Promise.all(destinationsPromise);
				const destinationIds = destinations.map((dest) => dest.id);

				// Buat highlights
				const highlightsPromise = await Promise.all(
					body.highlights.map((data) =>
						tx.highlight.create({
							data: {
								cruiseId: cruise.id,
								title: data.title,

								description: data.description,
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						})
					)
				);
				const highlights = await Promise.all(highlightsPromise);
				const highlightIds = highlights.map((hl) => hl.id);

				// Buat includes
				await Promise.all(
					body.include.map((data) =>
						tx.include.create({
							data: {
								cruiseId: cruise.id,
								title: data.title,
								description: data.description,
								createdAt: new Date(),
							},
						})
					)
				);

				// Buat informations
				await Promise.all(
					body.informations.map((data) =>
						tx.information.create({
							data: {
								cruiseId: cruise.id,
								title: data.title,
								text: data.text,
								createdAt: new Date(),
							},
						})
					)
				);
				return { ...cruise, highlightIds, destinationIds };
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

		if (!result) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process create data");
		}
		return result;
	},

	async find(cruiseId: string): Promise<ICruise> {
		// Pertama kita ambil data cruise beserta relasi
		const cruise = await prisma.cruise.findUnique({
			where: {
				id: cruiseId,
				AND: [
					{
						NOT: {
							status: "DELETED",
						},
					},
				],
			},
			select: {
				departure: true,
				duration: true,
				slug: true,
				subTitle: true,
				createdAt: true,
				description: true,
				id: true,
				title: true,
				status: true,
				updatedAt: true,
				destinations: {
					where: {
						NOT: {
							status: "DELETED",
						},
					},
					select: {
						cruiseId: true,
						id: true,
						createdAt: true,
						days: true,
						description: true,
						status: true,
						title: true,
						updatedAt: true,
					},
				},
				introductionText: true,
				introductionTitle: true,
				cta: true,
				include: {
					select: {
						title: true,
						description: true,
					},
				},
				highlights: {
					select: {
						id: true,
						updatedAt: true,
						createdAt: true,
						description: true,
						title: true,
					},
				},
				informations: {
					select: {
						id: true,
						title: true,
						text: true,
					},
				},
			},
		});

		if (!cruise) throw new ApiError(StatusCodes.NOT_FOUND, "Cruise is not found!");

		// Kemudian ambil semua gambar cover untuk destinations
		const destinationCovers = await prisma.image.findMany({
			where: {
				entityId: { in: cruise.destinations.map((dest) => String(dest.id)) },
				entityType: "DESTINATION",
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
		const highlightCovers = await prisma.image.findMany({
			where: {
				entityId: { in: cruise.highlights.map((highlight) => String(highlight.id)) },
				entityType: "HIGHLIGHT",
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
		const destinationsWithCover = cruise.destinations.map((destination) => {
			const cover = destinationCovers.find((cover) => cover.entityId === String(destination.id));
			return {
				...destination,
				cover: cover || null,
			};
		});

		// Tambahkan cover ke setiap highlight
		const highlightsWithCover = cruise.highlights.map((highlight) => {
			const cover = highlightCovers.find((cover) => cover.entityId === String(highlight.id));
			return {
				...highlight,
				cover: cover || null,
			};
		});

		// Kembalikan data cruise yang sudah dilengkapi dengan cover
		return {
			...cruise,
			destinations: destinationsWithCover,
			highlights: highlightsWithCover,
		};
	},

	async get(
		s?: string, // Search term
		f: boolean = false, // Sort order flag for updatedAt (false = descending, true = ascending)
		fav: boolean = false, // Extra favorite filter flag
		deleted: boolean = false // Show deleted items flag
	): Promise<ICruises[]> {
		// Build the base filter
		const filter: any = {};

		// Add search condition if provided
		if (s) {
			filter.title = { contains: s };
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
		return await prisma.cruise.findMany({
			where: filter,
			select: {
				departure: true,
				duration: true,
				createdAt: true,
				id: true,
				title: true,
				status: true,
				updatedAt: true,
			},
			orderBy: orderBy,
			take: 10,
		});
	},

	async update(id: string, body: ICruise) {
		// Check body title update
		const findCruise = await prisma.cruise.findUnique({
			where: {
				id: id,
			},
			select: {
				title: true,
			},
		});

		if (!findCruise) throw new ApiError(StatusCodes.NOT_FOUND, "The cruise is not found");
		if (body.title === findCruise.title) {
			await prisma.cruise.update({
				where: {
					id,
				},
				data: {
					departure: body.departure,
					description: body.description,
					duration: body.duration || "",
					cta: body.cta,
					introductionText: body.introductionText,
					introductionTitle: body.introductionTitle,
					subTitle: body.subTitle,
					updatedAt: new Date(),
				},
			});
		} else {
			const slug: string = slugify(body.title);
			const count = await this.countCruise(body.title, slug);
			if (count !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Cruise has already in database!");
			else
				await prisma.cruise.update({
					where: {
						id,
					},
					data: {
						departure: body.departure,
						description: body.description,
						duration: body.duration || "",
						cta: body.cta,
						introductionText: body.introductionText,
						introductionTitle: body.introductionTitle,
						subTitle: body.subTitle,
						title: body.title,
						updatedAt: new Date(),
					},
				});
		}
	},

	async action(action: STATUS, id: string, accountId: string): Promise<{ title: string; status: STATUS }> {
		const countId = await this.countId(id);
		if (countId === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Cruise is not found!");
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
		const cruise = await prisma.cruise.findUnique({
			where: {
				id,
			},
			select: {
				status: true,
				title: true,
			},
		});
		if (account?.role.name !== "admin") throw new ApiError(StatusCodes.FORBIDDEN, "Oppss... Your account can't access this service");
		if (cruise?.status === action) throw new ApiError(StatusCodes.OK, `${cruise.title} has already ${cruise.status}`);
		else
			return await prisma.cruise.update({
				where: {
					id,
				},
				data: {
					status: action,
					updatedAt: new Date(),
					destinations: {
						updateMany: {
							where: {
								cruiseId: id,
							},
							data: {
								status: action,
								updatedAt: new Date(),
							},
						},
					},
				},
				select: {
					title: true,
					status: true,
				},
			});
	},
};
