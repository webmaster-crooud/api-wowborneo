import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IInformation } from "../../../types/cruise";

export const informationService = {
	async create(cruiseId: string, body: IInformation) {
		const existing = await prisma.information.findFirst({
			where: { title: body.title, cruiseId },
		});

		if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, "Information already exists");

		return await prisma.information.create({
			data: {
				cruiseId,
				title: body.title,
				text: body.text || "",
			},
			select: { id: true },
		});
	},

	async update(id: number, body: IInformation) {
		return await prisma.information.update({
			where: { id },
			data: {
				title: body.title,
				text: body.text,
			},
		});
	},
	async delete(id: number) {
		const info = await prisma.information.findFirst({
			where: { id },
			select: { id: true },
		});
		if (!info) throw new ApiError(StatusCodes.NOT_FOUND, "Information is not found!");

		await prisma.information.delete({
			where: { id },
		});
	},
};
