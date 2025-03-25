import { StatusCodes } from "http-status-codes";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";
import { IFacilityRequestBody } from "../../../../types/facility";

export const facilityService = {
	async countFacility(id: number): Promise<number> {
		return await prisma.facility.count({
			where: {
				id: id,
			},
		});
	},

	async create(boatId: string, body: IFacilityRequestBody): Promise<{ id: number }> {
		const countBoat = await prisma.boat.count({
			where: {
				id: boatId,
			},
		});

		if (countBoat !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Boat is not found!");
		return await prisma.facility.create({
			data: {
				name: body.name,
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

	async update(facilityId: number, body: IFacilityRequestBody) {
		const count = await this.countFacility(parseInt(facilityId.toString()));
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Facility it's not found!");
		await prisma.facility.update({
			where: {
				id: facilityId,
			},
			data: {
				name: body.name,
				description: body.description,
			},
		});
	},

	async delete(facilityId: number) {
		await prisma.facility.delete({
			where: {
				id: facilityId,
			},
		});
	},
};
