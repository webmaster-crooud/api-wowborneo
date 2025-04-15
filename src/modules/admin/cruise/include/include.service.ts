import { StatusCodes } from "http-status-codes";
import { IInclude } from "../../../../types/cruise";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";

export const includeService = {
	async create(cruiseId: string, body: IInclude) {
		const existing = await prisma.include.findFirst({
			where: { title: body.title, cruiseId },
		});

		if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, "Include already exists");

		return await prisma.include.create({
			data: {
				cruiseId,
				title: body.title,
				description: body.description || "",
			},
			select: { id: true },
		});
	},

	async update(id: number, body: IInclude) {
		return await prisma.include.update({
			where: { id },
			data: {
				title: body.title,
				description: body.description,
			},
		});
	},

	async delete(id: number) {
		const include = await prisma.include.findFirst({
			where: { id },
			select: { id: true },
		});
		if (!include) throw new ApiError(StatusCodes.NOT_FOUND, "Include not found!");

		await prisma.include.delete({
			where: { id },
		});
	},
};
