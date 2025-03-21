import { StatusCodes } from "http-status-codes";
import prisma from "../../configs/database";
import { ApiError } from "../../libs/apiResponse";
import { IAccount, IChangePassword, IUpdateAccount } from "../../types/account";
import crypt from "bcrypt";
import { env } from "../../configs/env";

export const accountService = {
	async find(email: string): Promise<IAccount> {
		const account = await prisma.account.findUnique({
			where: {
				email: email,
			},

			include: {
				user: {
					select: {
						firstName: true,
						lastName: true,
						phone: true,
					},
				},
				role: {
					select: {
						name: true,
					},
				},
			},
		});
		const cover = await prisma.image.findFirst({
			where: {
				entityId: account?.id,
				entityType: "ACCOUNT",
			},
		});

		return {
			id: account?.id || "",
			ip: account?.ip || "",
			userAgent: account?.userAgent || "",
			email: account?.email || "",
			role: account?.role.name || "",
			firstName: account?.user.firstName || "",
			lastName: account?.user.lastName || "",
			phone: account?.user.phone || "",
			cover: cover?.source || "",
		};
	},

	async update(accountId: string, body: IUpdateAccount) {
		const user = await prisma.user.findFirst({
			where: {
				account: {
					id: accountId,
				},
			},
			select: {
				phone: true,
			},
		});
		if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "Account is not found!");
		else if (user.phone === body.phone) {
			await prisma.account.update({
				where: {
					id: accountId,
				},
				data: {
					user: {
						update: {
							firstName: body.firstName,
							lastName: body.lastName,
						},
					},
				},
			});
		} else {
			await prisma.account.update({
				where: {
					id: accountId,
				},
				data: {
					user: {
						update: {
							firstName: body.firstName,
							lastName: body.lastName,
							phone: body.phone,
						},
					},
				},
			});
		}
	},

	async checkPhoto(accountId: string): Promise<{ id: string | number }> {
		const image = await prisma.image.findFirst({
			where: {
				imageType: "PHOTO",
				entityId: accountId,
				entityType: "ACCOUNT",
			},
			select: {
				id: true,
			},
		});

		return {
			id: image?.id || "",
		};
	},

	async changePassword(accountId: string, body: IChangePassword) {
		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
				OR: [
					{
						status: {
							not: "PENDING",
						},
						user: {
							status: {
								not: "PENDING",
							},
						},
					},
					{
						status: {
							not: "BLOCKED",
						},
						user: {
							status: {
								not: "BLOCKED",
							},
						},
					},
				],
			},
			select: {
				password: true,
			},
		});

		const checkPassword = await crypt.compare(body.oldPassword, account?.password || "");
		if (!checkPassword) throw new ApiError(StatusCodes.BAD_REQUEST, "Your old password is not valid, please check your input again!");

		const salt = await crypt.genSalt(parseInt(env.BCRYPT_ROUND));
		const newPassword = crypt.hashSync(body.password, parseInt(salt));
		await prisma.account.update({
			where: {
				id: accountId,
			},
			data: {
				password: newPassword,
				updatedAt: new Date(),
			},
		});
	},
};
