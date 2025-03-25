import { StatusCodes } from "http-status-codes";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";
import { IExperienceResponse } from "../../../../types/experience";

export const experienceService = {
	async countExperience(id: number): Promise<number> {
		return await prisma.experience.count({
			where: {
				id: id,
			},
		});
	},

	async create(boatId: string, body: IExperienceResponse): Promise<{ id: number }> {
		const countBoat = await prisma.boat.count({
			where: {
				id: boatId,
			},
		});

		if (countBoat !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Boat is not found!");
		return await prisma.experience.create({
			data: {
				title: body.title,
				description: body.description,
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

	async update(experienceId: number, body: IExperienceResponse) {
		const count = await this.countExperience(parseInt(experienceId.toString()));
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Experience it's not found!");
		await prisma.experience.update({
			where: {
				id: experienceId,
			},
			data: {
				title: body.title,
				description: body.description,
			},
		});
	},

	async delete(experienceId: number) {
		await prisma.experience.delete({
			where: {
				id: experienceId,
			},
		});
	},
};
