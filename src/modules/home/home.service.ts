import prisma from "../../configs/database";
import { HomePageResponse, NavbarResponse } from "./home.type";

export const homeService = {
	async getNavbar(): Promise<NavbarResponse> {
		const cruise = await prisma.cruise.findMany({
			where: {
				OR: [{ status: "ACTIVED" }, { status: "FAVOURITED" }],
			},
			orderBy: {
				updatedAt: "desc",
			},
			select: {
				slug: true,
				title: true,
			},
		});

		const boat = await prisma.boat.findMany({
			where: {
				OR: [{ status: "ACTIVED" }, { status: "FAVOURITED" }],
			},
			orderBy: {
				updatedAt: "desc",
			},
			select: {
				name: true,
				slug: true,
			},
		});

		const result = {
			cruise: cruise.map((c, i) => ({
				title: c.title,
				slug: c.slug,
			})),
			boat: boat.map((b, i) => ({
				name: b.name,
				slug: b.slug,
			})),
		};

		return result;
	},
	async getDataHome(): Promise<HomePageResponse> {
		const cruise = await prisma.cruise.findMany({
			where: {
				OR: [{ status: "ACTIVED" }, { status: "FAVOURITED" }],
			},
			orderBy: {
				updatedAt: "desc",
			},
			select: {
				id: true,
				slug: true,
				title: true,
				description: true,
				duration: true,
				departure: true,
			},
		});

		const cruiseCover = await Promise.all(
			cruise.map(async (c) => {
				const result = await prisma.image.findFirst({
					where: {
						entityType: "CRUISE",
						entityId: c.id,
						imageType: "COVER",
					},
					select: {
						source: true,
					},
				});
				return result?.source || "";
			})
		);

		const boat = await prisma.boat.findMany({
			where: {
				OR: [{ status: "ACTIVED" }, { status: "FAVOURITED" }],
			},
			orderBy: {
				updatedAt: "desc",
			},
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
			},
		});

		const boatCover = await Promise.all(
			boat.map(async (b) => {
				const result = await prisma.image.findFirst({
					where: {
						entityType: "BOAT",
						entityId: b.id,
						imageType: "COVER",
					},
					select: {
						source: true,
					},
				});
				return result?.source || "";
			})
		);

		const result = {
			cruise: cruise.map((c, i) => ({
				title: c.title,
				description: c.description || "",
				departure: c.departure,
				duration: c.duration,
				slug: c.slug,
				cover: cruiseCover[i],
			})),
			boat: boat.map((b, i) => ({
				name: b.name,
				slug: b.slug,
				description: b.description || "",
				cover: boatCover[i],
			})),
		};

		return result;
	},
};
