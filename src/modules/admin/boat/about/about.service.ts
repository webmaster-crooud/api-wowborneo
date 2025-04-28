import { StatusCodes } from "http-status-codes";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";
import { IAboatRequestBody, IUpdateAboutRequest } from "../../../../types/about";

export const aboutService = {
	async countAbout(id: number): Promise<number> {
		return await prisma.about.count({
			where: {
				id: id,
			},
		});
	},

	async create(boatId: string, body: IAboatRequestBody) {
		const countBoat = await prisma.boat.count({
			where: {
				id: boatId,
			},
		});

		if (countBoat !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Boat is not found!");
		await prisma.about.create({
			data: {
				title: body.title,
				description: body.description,
				boat: {
					connect: {
						id: boatId,
					},
				},
			},
		});
	},

	async update(aboutid: number, body: IUpdateAboutRequest) {
		const count = await this.countAbout(parseInt(aboutid.toString()));
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "About it's not found!");
		await prisma.about.update({
			where: {
				id: aboutid,
			},
			data: {
				title: body.title,
				description: body.description,
			},
		});
	},

	async delete(aboutId: number) {
		await prisma.about.delete({
			where: {
				id: aboutId,
			},
		});
	},
};
