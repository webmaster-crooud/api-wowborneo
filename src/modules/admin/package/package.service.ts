import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IPackageResponse, IPackageRequest } from "./package.types";

export const packageService = {
	async list(): Promise<IPackageResponse[]> {
		const result = await prisma.package.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				status: true,
				packageCruise: {
					select: {
						cruises: {
							select: {
								title: true,
							},
						},
					},
				},
			},
		});

		return {
			...result.map((res) => ({
				id: res.id,
				title: res.title,
				description: res.description || "",
				date: res.createdAt !== res.updatedAt ? res.updatedAt : res.createdAt,
				status: res.status,
				cruises: res.packageCruise.map((pc) => ({
					title: pc.cruises.title,
				})),
			})),
		};
	},

	async create(body: IPackageRequest) {
		const countPackage = await prisma.package.count({
			where: {
				title: body.title,
			},
		});

		if (countPackage > 0) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Package is already exists");
		}

		await prisma.$transaction(async (tx) => {
			const createPackage = await tx.package.create({
				data: {
					title: body.title,
					description: body.description,
					status: "PENDING",
					updatedAt: new Date(),
					createdAt: new Date(),
				},
			});

			Promise.all(
				body.cruises.map(async (c) => {
					const countPC = await tx.packageCruise.findFirst({
						where: {
							cruiseId: c.cruiseId,
						},
						select: {
							packageId: true,
						},
					});
					if (!countPC?.packageId)
						await tx.packageCruise.create({
							data: {
								packageId: createPackage.id,
								cruiseId: c.cruiseId,
							},
						});
					else throw new ApiError(StatusCodes.BAD_GATEWAY, `Cruise ${c.cruiseId} is already have package`);
				})
			);
		});
	},
};
