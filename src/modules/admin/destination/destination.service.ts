import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";

import { STATUS } from "../../../types/main";
import { IDestination } from "../../../types/destination";

interface IBody {
	destination: IDestination[];
}
export const destinationService = {
	async countId(id: number): Promise<number> {
		const count = await prisma.destination.count({
			where: { id, NOT: { status: "DELETED" } },
		});
		return count;
	},

	async create(accountId: string, cruiseId: string, body: IBody): Promise<number> {
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

		const destination = body.destination[0];
		const data = await prisma.destination.findFirst({
			where: {
				title: destination.title,
			},
		});
		if (data) throw new ApiError(StatusCodes.BAD_REQUEST, `${destination.title} is already exist!`);
		const res = await prisma.destination.create({
			data: {
				cruiseId: cruiseId,
				status: account?.role.name === "admin" ? "ACTIVED" : "PENDING",
				description: destination.description || "",
				createdAt: new Date(),
				updatedAt: new Date(),
				days: destination.days || "",
				title: destination.title,
			},
			select: {
				id: true,
			},
		});

		return res.id;
	},

	async update(id: number, body: IDestination) {
		const count = await this.countId(id);
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Destination is not found!");
		await prisma.destination.update({
			where: {
				id,
			},
			data: {
				days: body.days || "",
				description: body.description,
				title: body.title,
				updatedAt: new Date(),
			},
		});
	},

	async action(action: STATUS, id: number): Promise<{ title: string; status: STATUS }> {
		await this.countId(id);
		return await prisma.destination.update({
			where: {
				id,
			},
			data: {
				status: action,
				updatedAt: new Date(),
			},
			select: {
				title: true,
				status: true,
			},
		});
	},

	async list(s?: string): Promise<IDestination[]> {
		// Build the base filter
		const filter: any = {
			OR: [
				{
					AND: [
						{ status: "ACTIVED" },
						{
							cruise: {
								status: "ACTIVED",
							},
						},
					],
				},
				{
					AND: [
						{ status: "FAVOURITED" },
						{
							cruise: {
								status: "FAVOURITED",
							},
						},
					],
				},
			],
		};

		// Add search condition if provided
		if (s) {
			filter.title = { contains: s };
		}

		const result = await prisma.destination.findMany({
			where: filter,
			include: {
				cruise: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 10,
		});
		const destinationCovers = await prisma.image.findMany({
			where: {
				entityId: { in: result.map((dest) => String(dest.id)) },
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
		const destinationsWithCover = result.map((destination) => {
			const cover = destinationCovers.find((cover) => cover.entityId === String(destination.id));
			return {
				...destination,
				cover: cover || null,
			};
		});
		return destinationsWithCover;
	},
};

// async get(): Promise<DestinationInterface[]> {
// 	return await prisma.destination.findMany({
// 		where: {
// 			AND: [
// 				{
// 					NOT: {
// 						status: "PENDING",
// 					},
// 				},
// 				{
// 					NOT: {
// 						status: "DELETED",
// 					},
// 				},
// 			],
// 		},
// 		select: {
// 			id: true,
// 			alt: true,
// 			createdAt: true,
// 			updatedAt: true,
// 			days: true,
// 			cruiseId: true,
// 			description: true,
// 			imageCover: true,
// 			title: true,
// 			status: true,
// 		},
// 	});
// },
