import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { CruiseResponse, PackageCruiseResponse, CruiseMinimal, CruisePage } from "./cruise.type";

export const cruiseService = {
	async listPackageCruise(): Promise<PackageCruiseResponse[]> {
		const result = await prisma.$queryRaw<PackageCruiseResponse[]>`
        SELECT
          p.title,
          p.description,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'title', c.title,
              'slug', c.slug,
              'price', (
                SELECT MIN(cab.price)
                FROM cabins cab
                JOIN boats b ON cab.boat_id = b.id
                JOIN schedules s ON s.boat_id = b.id
                WHERE s.cruise_id = c.id
              ),
              'cover', (
                SELECT source
                FROM images
                WHERE entity_id = c.id
                  AND entity_type = 'CRUISE'
                  AND image_type = 'COVER'
                LIMIT 1
              )
            )
          ) AS cruise
        FROM packages p
        JOIN package_cruises pc ON p.id = pc.packageId
        JOIN river_cruise c ON pc.cruiseId = c.id
        WHERE p.status = 'ACTIVED'
        AND c.status = 'ACTIVED'
        OR c.status = 'FAVOURITED'
        GROUP BY p.id

      `;

		return result.map((pkg) => ({
			...pkg,
			cruise: pkg.cruise.map((c) => ({
				...c,
				// Konversi decimal ke string
				price: c.price?.toString() || "0",
			})),
		}));
	},

	async find(slug: string): Promise<CruiseResponse> {
		// Pertama kita ambil data cruise beserta relasi
		const cruise = await prisma.cruise.findUnique({
			where: {
				slug: slug,
				AND: [
					{
						status: {
							notIn: ["PENDING", "DELETED", "BLOCKED"],
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
					orderBy: {
						days: "asc",
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
						id: true,
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

		// Ambil cover cruise
		const cruiseCover = await prisma.image.findFirst({
			where: {
				entityId: String(cruise.id),
				entityType: "CRUISE",
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

		// Ambil galeri cruise (photos)
		const cruiseGallery = await prisma.image.findMany({
			where: {
				entityId: String(cruise.id),
				entityType: "CRUISE",
				imageType: "PHOTO",
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

		// Kembalikan data cruise yang sudah dilengkapi dengan cover dan gallery
		return {
			title: cruise.title,
			slug: cruise.slug,
			information: cruise.informations.map((i) => ({
				title: i.title,
				text: i.text,
			})),
			included: cruise.include.map((inc) => ({
				title: inc.title,
				description: inc.description,
			})),
			price: "200",
			subHeading: cruise.subTitle || "",
			duration: cruise.duration,
			introduction: {
				title: cruise.introductionTitle || "",
				text: cruise.introductionText || "",
			},
			destinationText: "Each day of this itinerary offers a blend of discovery and relaxation, providing an authentic taste of Tanjung Puting’s incredible biodiversity.",
			description: cruise.description || "",
			departure: cruise.departure || "",
			cta: cruise.cta || "",
			cover: cruiseCover?.source || "",
			destination: destinationsWithCover.map((des) => ({
				cover: des.cover?.source || "",
				title: des.title,
				days: des.days,
				description: des.description || "",
				status: des.status,
				createdAt: "",
				updatedAt: "",
				id: 0,
			})),
			highlight: highlightsWithCover.map((h) => ({
				id: 0,
				cover: h.cover?.source,
				title: h.title,
				description: h.description || "",
			})),
		};
	},

	async minimal(): Promise<CruiseMinimal[]> {
		const result = await prisma.cruise.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
		});

		// Fetch cover images for each cruise
		const cruisesWithCover = await Promise.all(result.map(async (cruise) => {
			const cruiseCover = await prisma.image.findFirst({
				where: {
					entityId: String(cruise.id),
					entityType: "CRUISE",
					imageType: "COVER",
				},
				select: {
					source: true,
					alt: true,
				},
			});

			return {
				title: cruise.title,
				description: cruise.description || "",
				slug: cruise.slug,
				cover: cruiseCover?.source || "",
				coverAlt: cruiseCover?.alt || "",
				duration: cruise.duration || "",
			};
		}));

		return cruisesWithCover;
	},

	async page(): Promise<CruisePage[]> {
		const result = await prisma.package.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
			include: {
				packageCruise: {
					include: {
						cruises: true,
					},
				},
			},
		});

		const packagesWithCruises = await Promise.all(result.map(async (pkg) => {
			const activeCruises = pkg.packageCruise
				.filter(pc => pc.cruises && !["BLOCKED", "PENDING", "DELETED"].includes(pc.cruises.status))
				.map(pc => pc.cruises);

			const cruisesWithCover = await Promise.all(activeCruises.map(async (cruise) => {
				const cruiseCover = await prisma.image.findFirst({
					where: {
						entityId: String(cruise.id),
						entityType: "CRUISE",
						imageType: "COVER",
					},
					select: {
						source: true,
						alt: true,
					},
				});

				return {
					title: cruise.title,
					description: cruise.description || "",
					slug: cruise.slug,
					cover: cruiseCover?.source || "",
					coverAlt: cruiseCover?.alt || "",
					duration: cruise.duration || "",
				};
			}));

			return {
				title: pkg.title,
				description: pkg.description || "",
				cruises: cruisesWithCover,
			};
		}));

		return packagesWithCruises;
	},
};
