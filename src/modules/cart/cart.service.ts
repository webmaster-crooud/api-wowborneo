import { StatusCodes } from "http-status-codes";
import prisma from "../../configs/database";
import { redisClient } from "../../configs/redis";
import { ApiError } from "../../libs/apiResponse";
import { ICartAddonRequest, ICartGuestRequest, ICartResponse, ISetCartRequest } from "./cart.type";
import { IAddonRequest, IGuestRequest } from "../../types/transaction";

const generateKey = (accountId: string, scheduleId: string) => `transaction:${scheduleId}:${accountId}`;
const ONE_HOURS = 60 * 60 * 1; // detik

export const cartService = {
	async setCart(accountId: string, scheduleId: string, body: ISetCartRequest) {
		const key = generateKey(accountId, scheduleId);
		const getKey = await redisClient.get(key);

		if (getKey) {
			redisClient.del(key);
		}
		const schedule = await prisma.schedule.findUnique({
			where: {
				id: scheduleId,
			},
			select: {
				id: true,
				cruise: {
					select: {
						id: true,
						title: true,
					},
				},
				boat: {
					select: {
						cabins: {
							select: {
								id: true,
								price: true,
								maxCapacity: true,
							},
						},
					},
				},
			},
		});

		const account = await prisma.account.findUnique({
			where: {
				id: accountId,
			},
			select: {
				email: true,
			},
		});

		if (!schedule) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Schedule is not found!");
		} else {
			const findCabin = schedule.boat.cabins.find((cab) => cab.id === body.cabinId);
			if (!findCabin) throw new ApiError(StatusCodes.NOT_FOUND, "Cabin is not found!");
			const countBooking = await prisma.booking.count({
				where: {
					scheduleId: schedule?.id,
				},
			});
			const formatedData: ICartResponse = {
				email: account?.email || "",
				scheduleId: schedule.id,
				pax: body.pax,
				cabinId: findCabin.id.toString(),
				price: countBooking === 0 ? String(Number(findCabin.price) * findCabin.maxCapacity) : findCabin.price.toString(),
				cruise: {
					id: schedule.cruise.id,
					title: schedule.cruise.title,
				},
				addons: [],
				guests: [],
			};

			await redisClient.set(key, JSON.stringify(formatedData), {
				EX: ONE_HOURS,
			});
		}
	},
	async getCart(accountId: string, scheduleId: string): Promise<{ data: ICartResponse; ttl: number }> {
		const key = generateKey(accountId, scheduleId);

		const data = await redisClient.get(key);
		if (!data) {
			redisClient.del(key);
			throw new ApiError(StatusCodes.NOT_FOUND, "Transaction is not found!");
		}

		const ttl = await redisClient.ttl(key);
		return { ...JSON.parse(data), ttl };
	},
	async setAddonCart(accountId: string, scheduleId: string, body: ICartAddonRequest[]): Promise<ICartResponse> {
		const key = generateKey(accountId, scheduleId);
		const tx = await redisClient.get(key);
		if (!tx) {
			await redisClient.del(key);
			throw new ApiError(StatusCodes.NOT_FOUND, "Transaction proceess is failed");
		}

		const transaction = JSON.parse(tx);
		const validAddons = body.filter((addon) => addon.qty > 0);
		const addonsData = await Promise.all(
			validAddons.map(async (addon) => {
				const checkAddon = async () => {
					const data = await prisma.addon.findUnique({
						where: {
							id: addon.id,
							status: {
								notIn: ["PENDING", "BLOCKED", "DELETED"],
							},
						},
						select: { id: true, title: true, price: true, description: true, status: true },
					});
					return { ...data, qty: addon.qty };
				};

				const result = await checkAddon();

				if (!result) throw new ApiError(StatusCodes.NOT_FOUND, `${addon.id} is not found`);

				return {
					id: result.id || 0,
					qty: result.qty,
					description: result.description || "",
					price: result.price?.toString() || "",
					title: result.title || "",
					totalPrice: String(Number(result.qty) * Number(result.price)),
				} as IAddonRequest;
			})
		);

		const updatedTx: ICartResponse = { ...transaction, addons: addonsData, addonPrice: addonsData.reduce((idx, item) => idx + Number(item.totalPrice), 0) };
		await redisClient.set(key, JSON.stringify(updatedTx), {
			EX: ONE_HOURS,
		});
		return updatedTx;
	},
	async setGuestCart(accountId: string, scheduleId: string, body: ICartGuestRequest[]): Promise<ICartResponse> {
		const key = generateKey(accountId, scheduleId);
		const txJson = await redisClient.get(key);
		if (!txJson) {
			await redisClient.del(key);
			throw new ApiError(StatusCodes.NOT_FOUND, "Transaction process failed");
		}
		const transaction = JSON.parse(txJson) as ICartResponse;

		const agent = await prisma.agent.findUnique({
			where: {
				accountId: accountId,
			},
			select: {
				name: true,
				commission: true,
				commissionLocal: true,
				type: true,
			},
		});

		const guestsData: IGuestRequest[] = await Promise.all(
			body.map(async (g) => {
				const findGuest = await prisma.guest.findFirst({
					where: {
						OR: [{ identityNumber: g.identityNumber }, { email: g.email }],
					},
					select: {
						firstName: true,
						lastName: true,
						country: true,
						identityNumber: true,
						document: true,
						email: true,
						phone: true,
						type: true,
					},
				});

				let result: IGuestRequest;
				if (findGuest) {
					result = {
						email: findGuest.email,
						children: findGuest.type === "CHILD" ? true : false,
						firstName: findGuest.firstName,
						lastName: findGuest.lastName || "",
						identityNumber: findGuest.identityNumber,
						country: findGuest.country,
						document: findGuest.document || "",
						phone: findGuest.phone || "",
						price: findGuest.type === "CHILD" ? 0.5 * Number(transaction.price) : transaction.price,
						signature: g.signature,
					};
				} else {
					result = {
						...g,
						// Update nanti
						document: "",
						children: g.children ? true : false,
						price: g.children ? 0.5 * Number(transaction.price) : transaction.price,
					};
				}

				return result;
			})
		);
		const { totalPrice, countID, countNonID } = guestsData.reduce(
			(acc, g) => {
				const p = Number(g.price);
				acc.totalPrice += p;
				g.country.toLowerCase() === "indonesia" ? acc.countID++ : acc.countNonID++;
				return acc;
			},
			{ totalPrice: 0, countID: 0, countNonID: 0 }
		);

		// 2. Hitung komisi & totals
		const subTotal = Number(transaction.addonPrice) + totalPrice;
		const commission = agent ? (countID >= body.length ? agent.commissionLocal : agent.commission) : 0;
		const discountAmt = subTotal * (commission / 100);
		const finalTotal = subTotal - discountAmt;

		// 3. Bangun objek cart dan simpan
		const updatedCart: ICartResponse = {
			...transaction,
			guests: guestsData,
			guestPrice: totalPrice,
			subTotal,
			discount: commission,
			finalTotal,
			pax: body.length,
			method: "full",
			amountPayment: finalTotal,
			amountUnderPayment: 0,
		};

		await redisClient.set(key, JSON.stringify(updatedCart), {
			EX: ONE_HOURS,
		});
		return updatedCart;
	},
	async setMethodCart(accountId: string, scheduleId: string, body: { method: "dp" | "full" }): Promise<ICartResponse> {
		const key = generateKey(accountId, scheduleId);
		const tx = await redisClient.get(key);
		if (!tx) {
			await redisClient.del(key);
			throw new ApiError(StatusCodes.NOT_FOUND, "Transaction proceess is failed");
		}
		const transaction: ICartResponse = JSON.parse(tx);
		const updateCart: ICartResponse = {
			...transaction,
			method: body.method === "dp" ? "dp" : "full",
			amountPayment: body.method === "dp" ? 0.25 * Number(transaction.finalTotal) : transaction.finalTotal,
			amountUnderPayment: body.method === "dp" ? 0.75 * Number(transaction.finalTotal) : 0,
		};
		await redisClient.set(key, JSON.stringify(updateCart), {
			EX: ONE_HOURS,
		});

		return updateCart;
	},
};
