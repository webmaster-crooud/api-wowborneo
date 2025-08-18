import { STATUS } from "@prisma/client";
import prisma from "../../../configs/database";
import { IAccount } from "../../../types/account";
import { ApiError } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";

export const memberService = {
	async list(search?: string): Promise<IAccount[]> {
		let filter: any = {};
		// Perbaikan logika filter
		if (search && search.trim().length > 0) {
			const cleanSearch = search.trim().toLowerCase();
			filter.email = { contains: cleanSearch };
		}
		const account = await prisma.account.findMany({
			where: filter,
			include: {
				user: true,
				role: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		const accountCover = await prisma.image.findMany({
			where: {
				entityId: { in: account.map((acc) => acc.id) },
				entityType: "ACCOUNT",
				imageType: "COVER",
			},
			select: {
				id: true,
				entityId: true,
				entityType: true,
				imageType: true,
				source: true,
				alt: true,
			},
		});

		const formatedData: IAccount[] = account.map((data) => ({
			id: data.id,
			email: data.email,
			roleId: data.role.id,
			firstName: data.user.firstName,
			lastName: data.user.lastName || "",
			phone: data.user.phone,
			ip: data.ip,
			role: data.role.name,
			userAgent: data.userAgent,
			status: data.status,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			cover: accountCover.find((cover) => cover.entityId === data.id)?.source || "",
		}));

		return formatedData;
	},
	async listPaginated(search?: string, page: number = 1): Promise<{ data: IAccount[]; total: number; currentPage: number; totalPages: number }> {
		const itemPerPage = 10;
		let filter: any = {};
		// Perbaikan logika filter
		if (search && search.trim().length > 0) {
			const cleanSearch = search.trim().toLowerCase();
			filter.email = { contains: cleanSearch };
		}

		const total = await prisma.account.count({
			where: filter,
		});
		const account = await prisma.account.findMany({
			where: filter,
			include: {
				user: true,
				role: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: itemPerPage,
			skip: (page - 1) * itemPerPage,
		});

		const formatedData: IAccount[] = account.map((data) => ({
			id: data.id,
			email: data.email,
			roleId: data.role.id,
			firstName: data.user.firstName,
			lastName: data.user.lastName || "",
			phone: data.user.phone,
			ip: data.ip,
			role: data.role.name,
			userAgent: data.userAgent,
			status: data.status,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
		}));

		return {
			data: formatedData,
			total,
			currentPage: page,
			totalPages: Math.ceil(total / itemPerPage)
		};
	},
	async action(
		action: STATUS,
		id: string,
		accountId: string
	): Promise<{
		user: {
			firstName: string;
		};

		status: STATUS;
	}> {
		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
			},
			select: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});
		const member = await prisma.account.findUnique({
			where: {
				id,
			},
			select: {
				user: {
					select: {
						firstName: true,
					},
				},
				status: true,
				id: true,
			},
		});
		if (member?.status === "PENDING") {
			if (account?.role.name === "admin" && action === "ACTIVED") throw new ApiError(StatusCodes.FORBIDDEN, "Oppss... Your account can't access this service");
		}
		if (member?.status === action) throw new ApiError(StatusCodes.BAD_REQUEST, `${member.user.firstName} has already ${member.status}`);
		else
			return await prisma.account.update({
				where: {
					id,
				},
				data: {
					status: action,
					updatedAt: new Date(),
				},
				select: {
					user: {
						select: {
							firstName: true,
						},
					},
					status: true,
				},
			});
	},

	async changeRole(
		roleId: number,
		memberId: string,
		accountId: string
	): Promise<{
		user: {
			firstName: string;
		};

		role: {
			name: string;
		};
	}> {
		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
			},
			select: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});
		const member = await prisma.account.findUnique({
			where: {
				id: memberId,
			},
			select: {
				user: {
					select: {
						firstName: true,
					},
				},
				role: {
					select: {
						id: true,
						name: true,
					},
				},
				id: true,
			},
		});

		if ((account?.role.name === "admin" && roleId === 4) || (account?.role.name === "admin" && roleId === 5)) throw new ApiError(StatusCodes.FORBIDDEN, "Oppss... Your account can't access this service");

		if (member?.role.id === roleId) throw new ApiError(StatusCodes.BAD_REQUEST, `${member.user.firstName} has already ${member.role.name}`);
		else
			return await prisma.account.update({
				where: {
					id: memberId,
				},
				data: {
					role: {
						connect: {
							id: roleId,
						},
					},
					updatedAt: new Date(),
				},
				select: {
					role: {
						select: {
							name: true,
						},
					},
					user: {
						select: {
							firstName: true,
						},
					},
					status: true,
				},
			});
	},
};
