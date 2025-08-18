import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IPromotionRequest, IPromotionResponse } from "./promotion.type";

export const promotionService = {
	async create(body: IPromotionRequest) {
		const checkPromotion = await prisma.promotion.count({
			where: {
				code: body.code,
			},
		});
		if (checkPromotion !== 0) throw new ApiError(StatusCodes.CONFLICT, "This code promotion is already exist");

		await prisma.promotion.create({
			data: {
				name: body.name,
				code: body.code,
				status: "ACTIVED",
				discountType: body.discountType,
				discountValue: body.discountValue,
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
	},
	async update(id: string, body: IPromotionRequest) {
		const checkPromotion = await prisma.promotion.count({
			where: {
				id: id.toString(),
			},
		});

		if (checkPromotion !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Promotino is not found!");

		await prisma.promotion.update({
			where: {
				id: id.toString(),
			},
			data: {
				name: body.name,
				discountType: body.discountType,
				discountValue: body.discountValue,
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				updatedAt: new Date(),
			},
		});
	},

	async list(): Promise<IPromotionResponse[]> {
		return await prisma.promotion.findMany({
			where: {
				status: "ACTIVED",
			},
			take: 10,
			orderBy: {
				updatedAt: "desc",
			},
		});
	},

	async listPaginated(search?: string, page: number = 1): Promise<{ data: IPromotionResponse[]; total: number; currentPage: number; totalPages: number }> {
		const itemPerPage = 10;
		// Build the base filter
		const filter: any = {};

		if (search) {
			filter.name = { contains: search };
		}

		filter.status = "ACTIVED";

		const total = await prisma.promotion.count({ where: filter });
		const data = await prisma.promotion.findMany({
			where: filter,
			orderBy: {
				updatedAt: "desc",
			},
			take: itemPerPage,
			skip: (page - 1) * itemPerPage,
		});

		return {
			data,
			total,
			currentPage: page,
			totalPages: Math.ceil(total / itemPerPage)
		};
	},

	async delete(id: string) {
		const checkPromotion = await prisma.promotion.count({
			where: {
				id: id.toString(),
			},
		});

		if (checkPromotion !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Promotino is not found!");

		await prisma.promotion.delete({
			where: {
				id: id,
			},
		});
	},
};
