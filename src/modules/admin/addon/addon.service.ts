import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IAddonRequest, IAddonResponse } from "./addon.type";
import { STATUS } from "@prisma/client";

export const addonService = {
	async create(accountId: string, body: IAddonRequest): Promise<{ id: number }> {
		const countAddon = await prisma.addon.count({
			where: {
				title: body.title,
			},
		});

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

		if (countAddon !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Title is already exist");
		return await prisma.addon.create({
			data: {
				title: body.title,
				description: body.description,
				cover: body.cover,
				price: body.price,
				status: !body.status ? (account?.role.name === "admin" ? "PENDING" : "ACTIVED") : body.status,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			select: {
				id: true,
			},
		});
	},

	async update(body: IAddonRequest, addonId: number) {
		const addon = await prisma.addon.findUnique({
			where: {
				id: addonId,
			},
		});

		if (!addon) throw new ApiError(StatusCodes.NOT_FOUND, "Add on is not found!");
		if (addon.title === body.title) {
			await prisma.addon.update({
				where: {
					id: addon.id,
				},
				data: {
					description: body.description,
					cover: body.cover,
					price: body.price,
					updatedAt: new Date(),
				},
			});
		} else {
			const countAddon = await prisma.addon.count({
				where: {
					title: body.title,
				},
			});
			if (countAddon !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Title is already exist");
			await prisma.addon.update({
				where: {
					id: addon.id,
				},
				data: {
					title: body.title,
					description: body.description,
					cover: body.cover,
					price: body.price,
					updatedAt: new Date(),
				},
			});
		}

		// await prisma.addon.update({
		// 	data: {
		// 		title: body.title,
		// 		description: body.description,
		// 		cover: body.cover,
		// 		price: body.price,
		// 		updatedAt: new Date(),
		// 	},
		// });
	},

	async action(addonId: number, action: STATUS) {
		const addon = await prisma.addon.findUnique({
			where: {
				id: addonId,
			},
		});

		if (!addon) throw new ApiError(StatusCodes.NOT_FOUND, "Add on is not found!");
		if (addon.status === action) throw new ApiError(StatusCodes.BAD_REQUEST, `Addon is already ${action.toLocaleLowerCase()}`);
		await prisma.addon.update({
			where: {
				id: addon.id,
			},
			data: {
				status: action,
				updatedAt: new Date(),
			},
		});
	},

	async list(): Promise<IAddonResponse[]> {
		const addon = await prisma.addon.findMany({
			where: {
				status: {
					not: "DELETED",
				},
			},
			select: {
				cover: true,
				title: true,
				description: true,
				id: true,
				createdAt: true,
				updatedAt: true,
				price: true,
				status: true,
			},
		});

		const addonIds = addon.map((a) => String(a.id));
		const cover = await prisma.image.findMany({
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
		const coverMap = new Map(cover.map((cover) => [cover.entityId, cover.source]));
		const formattedData: IAddonResponse[] = addon.map((item) => {
			return {
				...item,
				cover: coverMap.get(String(item.id)) || null, // Tambahkan cover dari mapping
			};
		});

		return formattedData;
	},

	async listPending(): Promise<IAddonResponse[]> {
		return await prisma.addon.findMany({
			where: {
				status: "PENDING",
			},
			select: {
				cover: true,
				title: true,
				description: true,
				id: true,
				createdAt: true,
				updatedAt: true,
				price: true,
				status: true,
			},
		});
	},
};
