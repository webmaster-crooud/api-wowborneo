import prisma from "../../../configs/database";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../../libs/apiResponse";
import { IBoat, IBoatListPage, IBoatMinimal, IBoatDetail } from "./boat.type";

export class BoatService {
	static async list(): Promise<IBoat[]> {
		const result = await prisma.boat.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
			include: {
				abouts: true,
				facilities: true,
				deck: true,
				experiences: true,
			},
		});

		return result.map((boat) => ({
			name: boat.name,
			description: boat.description || "",
			slug: boat.slug,
			abouts: boat.abouts.flatMap((ab) => ({
				...ab,
				description: ab.description || "",
			})),
			deck: {
				title: boat.deck?.title || "",
				description: boat.deck?.description || "",
				image: "",
			},
			experiences: boat.experiences.flatMap((ex) => ({
				...ex,
				description: ex.description || "",
			})),
			facilities: boat.facilities.flatMap((f) => ({
				...f,
				description: f.description || "",
				icon: f.icon || "",
			})),
			cover: "",
		}));
	}

	// Get page boat data used for listing or card.
	static async page(): Promise<IBoatListPage[]> {
		const result = await prisma.boat.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
			include: {
				facilities: true,
			},
		});

		// Fetch cover images for each boat
		const boatsWithCover = await Promise.all(
			result.map(async (boat) => {
				const boatCover = await prisma.image.findFirst({
					where: {
						entityId: String(boat.id),
						entityType: "BOAT",
						imageType: "COVER",
					},
					select: {
						source: true,
						alt: true,
					},
				});

				return {
					name: boat.name,
					description: boat.description || "",
					slug: boat.slug,
					cover: boatCover?.source || "",
					facilities: boat.facilities.map((f) => ({
						name: f.name,
						icon: f.icon || "",
						description: f.description || "",
					})),
				};
			})
		);

		return boatsWithCover;
	}

	// Get minimal boat data used for listing or card.
	static async minimal(): Promise<IBoatMinimal[]> {
		const result = await prisma.boat.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
		});

		// Fetch cover images for each boat
		const boatsWithCover = await Promise.all(
			result.map(async (boat) => {
				const boatCover = await prisma.image.findFirst({
					where: {
						entityId: String(boat.id),
						entityType: "BOAT",
						imageType: "COVER",
					},
					select: {
						source: true,
						alt: true,
					},
				});

				return {
					name: boat.name,
					description: boat.description || "",
					slug: boat.slug,
					cover: boatCover?.source || "",
					coverAlt: boatCover?.alt || "",
				};
			})
		);

		return boatsWithCover;
	}

	// Get boat detail by slug.
	static async detailBySlug(slug: string): Promise<IBoatDetail | null> {
		// Pertama kita ambil data cruise beserta relasi
		const boat = await prisma.boat.findUnique({
			where: { slug },
			include: {
				abouts: true,
				cabins: true,
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
				type: cabin.type,
				cover: cover?.source || "",
				description: cabin.description || "",
				price: cabin.price?.toString() || "",
			};
		});

		// Tambahkan cover ke setiap highlight
		const experienceWithCover = boat.experiences.map((experience) => {
			const cover = experienceCover.find((cover) => cover.entityId === String(experience.id));
			return {
				id: experience.id,
				title: experience.title,
				description: experience.description || "",
				cover: cover?.source || "",
			};
		});

		// Kembalikan data cruise yang sudah dilengkapi dengan cover dan gallery
		const getCruise = await prisma.schedule.findFirst({
			where: {
				boatId: boat.id,
			},
			select: {
				cruise: {
					select: {
						title: true,
					},
				},
			},
		});

		return {
			name: boat.name,
			slug: boat.slug,
			option: boat.optionText || "",
			description: boat.description || "",
			cover: boatCover?.source || "",
			coverAlt: boatCover?.alt || "",
			abouts: boat.abouts.map((a) => ({
				id: a.id,
				title: a.title,
				description: a.description || "",
			})),
			facilities: boat.facilities.map((f) => ({
				name: f.name,
				icon: f.icon || "",
				description: f.description || "",
			})),
			cabins: cabinWithCover || null,
			experiences: experienceWithCover || null,
			deck: {
				image: deckCover?.source || null,
				title: boat.deck?.title || "",
				description: boat.deck?.description || "",
			},
			cruise: getCruise?.cruise.title || "",
		};
	}
}
