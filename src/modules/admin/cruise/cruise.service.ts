import slugify from "slugify";
import prisma from "../../../configs/database";
import { CruiseInterface } from "../../../types/cruise";
import { ApiError } from "../../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../types/main";

/* 
notes:
s = search
f = filter;
*/

export const cruiseService = {
	async countId(id: string) {
		const count = await prisma.cruise.count({
			where: { id },
		});

		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Cruise is not found!");
		return;
	},
	async create(accountId: string, body: CruiseInterface) {
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
		const slug: string = slugify(body.slug);

		const countCruise = await prisma.cruise.count({
			where: {
				title: body.title,
				slug: slug,
			},
		});

		if (countCruise !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Cruise has already in database!");

		const cruise = await prisma.cruise.create({
			data: {
				title: body.title,
				slug,
				subTitle: body.subTitle,
				duration: body.duration || "",
				departure: body.departure,
				description: body.description,
				status: account?.role.name === "admin" ? "ACTIVED" : "PENDING",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		// Multiple Destination
		await Promise.all(
			body.destinations.map((destination) =>
				prisma.destination.create({
					data: {
						cruiseId: cruise.id,
						status: cruise.status,
						description: destination.description || "",
						createdAt: new Date(),
						updatedAt: new Date(),
						days: destination.days || "",
						alt: destination.alt || "",
						title: destination.title,
						imageCover: destination.imageCover || "",
					},
				})
			)
		);
	},
	async find(cruiseId: string): Promise<CruiseInterface> {
		const cruise = await prisma.cruise.findUnique({
			where: {
				id: cruiseId,
				AND: [
					{
						NOT: {
							status: "PENDING",
						},
					},
					{
						NOT: {
							status: "DELETED",
						},
					},
				],
			},
			select: {
				departure: true,
				duration: true,
				slug: true,
				subTitle: true,
				createdAt: true,
				description: true,
				id: true,
				title: true,
				status: true,
				updatedAt: true,
				destinations: {
					select: {
						id: true,
						alt: true,
						createdAt: true,
						cruiseId: true,
						description: true,
						days: true,
						imageCover: true,
						status: true,
						title: true,
						updatedAt: true,
					},
				},
			},
		});

		if (!cruise) throw new ApiError(StatusCodes.NOT_FOUND, "Cruise is not found!");

		return cruise;
	},
	async get(s?: string, f: boolean = false, fav: boolean = false, deleted: boolean = false): Promise<CruiseInterface[]> {
		// Membangun filter dasar dengan pencarian LIKE
		const baseFilter: any = {
			...(s ? { title: { contains: s } } : {}), // LIKE query
			...(fav ? { status: "FAVOURITED" } : {}),
		};

		// Mengatur filter status sesuai parameter 'deleted'
		if (deleted) {
			// Jika 'deleted' true, ambil data yang berstatus DELETED (tetap kecualikan PENDING)
			baseFilter.AND = [{ status: "PENDING" }, { status: "DELETED" }];
		} else {
			// Jika 'deleted' false, pastikan tidak mengambil data yang PENDING atau DELETED
			baseFilter.AND = [{ NOT: { status: "PENDING" } }, { NOT: { status: "DELETED" } }];
		}

		return await prisma.cruise.findMany({
			where: baseFilter,
			select: {
				departure: true,
				duration: true,
				slug: true,
				subTitle: true,
				createdAt: true,
				description: true,
				id: true,
				title: true,
				status: true,
				updatedAt: true,
				destinations: true,
			},
			orderBy: {
				updatedAt: f ? "desc" : "asc",
			},
		});
	},
	async update(id: string, body: CruiseInterface) {
		await this.countId(id);

		await prisma.cruise.update({
			where: {
				id,
			},
			data: {
				departure: body.departure,
				description: body.description,
				duration: body.duration || "",
				slug: body.slug,
				subTitle: body.subTitle,
				title: body.title,
				updatedAt: new Date(),
				status: body.status,
			},
		});
	},
	async action(action: STATUS, id: string, accountId: string): Promise<{ title: string; status: STATUS }> {
		await this.countId(id);
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
		const cruise = await prisma.cruise.findUnique({
			where: {
				id,
			},
			select: {
				status: true,
				title: true,
			},
		});
		if (account?.role.name !== "admin") throw new ApiError(StatusCodes.FORBIDDEN, "Oppss... Your account can't access this service");
		if (cruise?.status === action) throw new ApiError(StatusCodes.OK, `${cruise.title} has already ${cruise.status}`);
		else
			return await prisma.cruise.update({
				where: {
					id,
				},
				data: {
					status: action,
					updatedAt: new Date(),
					destinations: {
						updateMany: {
							where: {
								cruiseId: id,
							},
							data: {
								status: action,
								updatedAt: new Date(),
							},
						},
					},
				},
				select: {
					title: true,
					status: true,
				},
			});
	},
};
