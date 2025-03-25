import { StatusCodes } from "http-status-codes";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";
import { ICabinRequestBody } from "../../../../types/cabin";

export const cabinService = {
	async countCabin(id: number): Promise<number> {
		return await prisma.cabin.count({
			where: {
				id: id,
			},
		});
	},

	async create(boatId: string, body: ICabinRequestBody): Promise<{ id: number }> {
		const countBoat = await prisma.boat.count({
			where: {
				id: boatId,
			},
		});

		if (countBoat !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Boat is not found!");
		return await prisma.cabin.create({
			data: {
				name: body.name,
				description: body.description,
				maxCapacity: body.maxCapacity,
				price: body.price,
				type: body.type,
				boat: {
					connect: {
						id: boatId,
					},
				},
			},
			select: {
				id: true,
			},
		});
	},

	async update(cabinId: number, body: ICabinRequestBody) {
		const count = await this.countCabin(parseInt(cabinId.toString()));
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "cabin it's not found!");
		await prisma.cabin.update({
			where: {
				id: cabinId,
			},
			data: {
				name: body.name,
				description: body.description,
				maxCapacity: body.maxCapacity,
				price: body.price,
				type: body.type,
			},
		});
	},

	async delete(cabinId: number) {
		await prisma.cabin.delete({
			where: {
				id: cabinId,
			},
		});
	},
};
