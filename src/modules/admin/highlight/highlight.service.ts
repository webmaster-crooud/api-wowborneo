import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IHighlight } from "../../../types/highlight";
import { deleteS3 } from "../../../middlewares/s3";

interface IBody {
	highlights: IHighlight[];
}

export const highlightService = {
	async countId(id: number): Promise<number> {
		return await prisma.highlight.count({
			where: { id },
		});
	},

	async create(cruiseId: string, body: IBody): Promise<number> {
		const highlight = body.highlights[0];
		const existing = await prisma.highlight.findFirst({
			where: { title: highlight.title, cruiseId },
		});

		if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, `${highlight.title} already exists`);

		const res = await prisma.highlight.create({
			data: {
				cruiseId,
				createdAt: new Date(),
				updatedAt: new Date(),
				description: highlight.description || "",
				title: highlight.title,
			},
			select: { id: true },
		});

		return res.id;
	},

	async update(id: number, body: IHighlight) {
		const count = await this.countId(id);
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Highlight not found");

		await prisma.highlight.update({
			where: { id },
			data: {
				description: body.description,
				title: body.title,
				updatedAt: new Date(),
			},
		});
	},

	async delete(id: number) {
		const hl = await prisma.highlight.findFirst({
			where: { id },
			select: { id: true },
		});
		if (!hl) throw new ApiError(StatusCodes.NOT_FOUND, "Highlight is not found!");
		const cover = await prisma.image.findFirst({
			where: {
				entityId: String(hl?.id),
				entityType: "HIGHLIGHT",
				imageType: "COVER",
			},
			select: {
				source: true,
			},
		});

		if (cover) {
			deleteS3(String(cover?.source));
			await prisma.highlight.delete({
				where: { id },
			});
		} else {
			await prisma.highlight.delete({
				where: { id },
			});
		}
	},
};
