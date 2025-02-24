import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { DestinationInterface } from "../../../types/destination";
import { STATUS } from "../../../types/main";

export const destinationService = {
	async countId(id: number) {
		const count = await prisma.destination.count({
			where: { id },
		});

		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Destination is not found!");
		return;
	},

	async create(accountId: string, cruiseId: string, body: DestinationInterface[]) {
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

		await Promise.all(
			body.map(async (destination) =>
				prisma.destination.create({
					data: {
						cruiseId: cruiseId,
						status: account?.role.name === "admin" ? "ACTIVED" : "PENDING",
						description: destination.description || "",
						createdAt: new Date(),
						updatedAt: new Date(),
						days: destination.days || "",
						alt: destination.alt || "",
						title: destination.title,
						imageCover: destination.imageCover || "",
					},
				})
			)
		);
	},

	async update(id: number, body: DestinationInterface) {
		await this.countId(id);

		await prisma.destination.update({
			where: {
				id,
			},
			data: {
				alt: body.alt,
				days: body.days || "",
				description: body.description,
				imageCover: body.imageCover,
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
