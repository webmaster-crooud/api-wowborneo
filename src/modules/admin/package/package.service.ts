import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IPackageResponse, IPackageRequest } from "./package.types";
import e from "express";

export const packageService = {
	async list(): Promise<Array<IPackageResponse>> {
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
			orderBy: {
				updatedAt: "desc",
			},
			take: 10,
		});

		return [
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
		];
	},

	async cruiseList(): Promise<{ id: string; title: string }[]> {
		return await prisma.cruise.findMany({
			where: {
				packageCruise: {
					none: {},
				},
			},
			select: {
				id: true,
				title: true,
			},
		});
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

			await Promise.all(
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

	async detail(id: string): Promise<IPackageResponse> {
		const result = await prisma.package.findFirst({
			where: {
				id: id,
				status: "ACTIVED",
			},
			include: {
				packageCruise: {
					include: {
						cruises: true,
					},
				},
			},
		});

		if (!result) throw new ApiError(StatusCodes.NOT_FOUND, "Package is not found!");
		return {
			id: result?.id,
			title: result?.title,
			description: result?.description || "",
			status: result.status,
			cruises: [
				...result.packageCruise.map((pc) => ({
					title: pc.cruises.title,
					id: pc.cruises.id,
				})),
			],
			date: result.createdAt === result.updatedAt ? result.createdAt : result.updatedAt,
		};
	},

	async deleteCruise(packageId: string, cruiseId: string) {
		await prisma.packageCruise.delete({
			where: {
				cruiseId_packageId: {
					packageId,
					cruiseId,
				},
			},
		});
	},
	async update(packageId: string, body: IPackageRequest) {
		const countPackage = await prisma.package.count({
			where: {
				id: packageId,
			},
		});

		if (countPackage !== 1) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Package is not found!");
		}

		await prisma.$transaction(async (tx) => {
			const updateCruise = await tx.package.update({
				where: {
					id: packageId,
				},
				data: {
					title: body.title,
					description: body.description,
					updatedAt: new Date(),
				},
			});

			await Promise.all(
				body.cruises.map(async (c) => {
					await tx.packageCruise.upsert({
						where: {
							cruiseId_packageId: {
								cruiseId: c.cruiseId,
								packageId: updateCruise.id, // ID package yang diupdate
							},
						},
						create: {
							// Jika belum ada, buat baru
							packageId: updateCruise.id,
							cruiseId: c.cruiseId,
						},
						update: {},
					});
				})
			);
		});
	},

	async actived(packageId: string) {
		await prisma.package.update({
			where: {
				id: packageId,
			},
			data: {
				status: "ACTIVED",
			},
		});
	},

	async deletePackage(packageId: string) {
		await prisma.package.delete({
			where: {
				id: packageId,
				packageCruise: {
					every: {
						packageId: packageId,
					},
				},
			},
		});
	},
};
