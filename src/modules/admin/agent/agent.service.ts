import { StatusCodes } from "http-status-codes";
import prisma from "../../../configs/database";
import { ApiError } from "../../../libs/apiResponse";
import { IAgentRequest, IAgentResponse } from "./agent.type";

export const agentService = {
	async create(body: IAgentRequest) {
		const account = await prisma.account.findFirst({
			where: { id: body.accountId },
			include: {
				role: true,
				user: true,
			},
		});

		if (!account) throw new ApiError(StatusCodes.NOT_FOUND, "Account is not found!");
		if (account.status === "PENDING" || account.status === "BLOCKED" || account.status === "DELETED") throw new ApiError(StatusCodes.CONFLICT, "Account is not active, please contact us!");
		if (account.role.name === "agent") throw new ApiError(StatusCodes.BAD_REQUEST, "Account is already as agent");

		await prisma.$transaction(async (tx) => {
			await tx.account.update({
				where: { id: account.id },
				data: {
					roleId: 3,
					updatedAt: new Date(),
				},
			});

			await tx.agent.create({
				data: {
					accountId: account.id,
					commission: body.commission,
					commissionLocal: body.commissionLocal,
					name: `${account.user.firstName} ${account.user.lastName}`,
					type: body.type,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
		});
	},

	async update(id: string, body: IAgentRequest) {
		const account = await prisma.account.findFirst({
			where: { id: body.accountId },
			include: {
				role: true,
				user: true,
			},
		});

		if (!account) throw new ApiError(StatusCodes.NOT_FOUND, "Account is not found!");
		if (account.status === "PENDING" || account.status === "BLOCKED" || account.status === "DELETED") throw new ApiError(StatusCodes.CONFLICT, "Account is not active, please contact us!");

		await prisma.agent.update({
			where: {
				id: id,
			},
			data: {
				commission: body.commission,
				commissionLocal: body.commissionLocal,
				type: body.type,
				updatedAt: new Date(),
			},
		});
	},

	async list(): Promise<IAgentResponse[]> {
		return await prisma.agent.findMany();
	},
};
