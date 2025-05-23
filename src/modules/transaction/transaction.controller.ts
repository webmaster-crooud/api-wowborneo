import { Request, Response } from "express";
import { transactionService } from "./transaction.service";
import { ApiError, ApiResponse } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { IAddonRequest, IRepaymentRequest, ITransactionRequest } from "../../types/transaction";
import { env } from "../../configs/env";
import { v4 as uuid } from "uuid";
import prisma from "../../configs/database";
import { generateDigest, generateCode, generateSignature } from "../../utils/transaction";
import { log } from "../../utils/logging";
import { getExchangeRate } from "../../utils/exhangeRates";
import { redisClient } from "../../configs/redis";
import { ICartResponse } from "../cart/cart.type";

// async function listScheduleController(req: Request, res: Response) {
// 	try {
// 		const { search, date, cruiseId, pax } = req.query;

// 		const result = await transactionService.list({
// 			search: String(search || ""),
// 			date: date ? new Date(String(date)) : undefined,
// 			cruiseId: String(cruiseId || ""),
// 			pax: Number(pax) || undefined,
// 		});

// 		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
// 	} catch (error) {
// 		ApiResponse.sendError(res, error as Error);
// 	}
// }

async function listController(req: Request, res: Response) {
	try {
		const { cruiseId, month, pax } = req.query;
		console.log(month);
		const data = await transactionService.list({ cruiseId: cruiseId?.toString(), month: month?.toString(), pax: pax ? Number(pax.toString()) : 1 });
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function listCruiseController(req: Request, res: Response) {
	try {
		const data = await transactionService.listCruise();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function findController(req: Request, res: Response) {
	try {
		const { scheduleId } = req.params;
		if (!scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule Identify is required!");
		const result = await transactionService.find(scheduleId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function bookingItineryController(req: Request, res: Response) {
	try {
		const { scheduleId, cabinId } = req.params;
		if (!cabinId && !scheduleId) throw new ApiError(StatusCodes.BAD_REQUEST, "Schedule & Cabin Identify is required!");
		const result = await transactionService.bookingItenerary(scheduleId, cabinId);
		ApiResponse.sendSuccess(res, result, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function paymentController(req: Request, res: Response) {
	const { accountId, firstName, lastName, email } = req.user;
	try {
		const { scheduleId } = req.params;
		const key = `transaction:${scheduleId}:${accountId}`;
		const tx = await redisClient.get(key);
		if (!tx) {
			await redisClient.del(key);
			throw new ApiError(StatusCodes.NOT_FOUND, "Transaction proceess is failed");
		}
		const data: ICartResponse = JSON.parse(tx);
		const code = generateCode(data.scheduleId);
		const requestId = uuid();
		const clientId = env.DOKU_CLIENT_ID!;
		const requestTimestamp = new Date().toISOString().split(".")[0] + "Z";
		const endpointPath = "/checkout/v1/payment";
		const exchangeRate = await getExchangeRate();

		const countCode = await prisma.booking.count({
			where: {
				id: code,
			},
		});
		if (countCode !== 0) throw new ApiError(StatusCodes.BAD_REQUEST, "Booking code is already exist!");
		const items =
			data.method === "full"
				? [
						// Hanya menyebarkan addons jika array tidak kosong
						...(data.addons.length > 0
							? data.addons.map((addon) => ({
									name: addon.title,
									price: Math.floor(Number(addon.totalPrice) * exchangeRate),
									quantity: addon.qty,
									type: "Addons",
								}))
							: []), // Jika kosong, gunakan array kosong (tidak memengaruhi items)
						...(data.guests?.length > 0
							? data.guests.map((guest) => ({
									name: `${guest.firstName} ${guest.lastName}: ${guest.identityNumber} - ${data.cruise.title}`,
									quantity: 1,
									price: Math.floor(Number(guest.price) * exchangeRate),
									type: guest.children ? "Children" : "Adult",
								}))
							: []),
					]
				: [
						{
							name: `Down Payment: ${code}`,
							quantity: 1,
							price: Math.floor(Number(data.amountPayment) * exchangeRate),
							type: "Down Payment",
						},
					];

		const payload = {
			order: {
				client_id: clientId,
				invoice_number: code,
				amount: Math.floor(Number(data.amountPayment) * exchangeRate),
				currency: "IDR",
				callback_url: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/callback?code=${code}`,
				callback_url_cancel: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/cancel?code=${code}`,
				callback_url_result: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/result?code=${code}`,
				language: "EN",
				auto_redirect: true,
				disable_retry_payment: true,
				line_items: items,
			},
			customer: {
				id: accountId,
				name: firstName,
				last_name: lastName || "",
				email: email,
			},
			payment: {
				payment_due_date: 60,
				type: "SALE",
				payment_method_types: ["VIRTUAL_ACCOUNT_BCA", "VIRTUAL_ACCOUNT_BANK_MANDIRI", "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI", "VIRTUAL_ACCOUNT_DOKU", "VIRTUAL_ACCOUNT_BRI", "VIRTUAL_ACCOUNT_BNI", "VIRTUAL_ACCOUNT_BANK_PERMATA", "VIRTUAL_ACCOUNT_BANK_CIMB", "VIRTUAL_ACCOUNT_BANK_DANAMON", "ONLINE_TO_OFFLINE_ALFA", "CREDIT_CARD", "DIRECT_DEBIT_BRI", "EMONEY_SHOPEEPAY", "EMONEY_OVO", "QRIS", "PEER_TO_PEER_AKULAKU", "PEER_TO_PEER_KREDIVO", "PEER_TO_PEER_INDODANA"],
			},
		};

		// Generate digest
		const jsonBody = JSON.stringify(payload, null, 0);
		const digest = generateDigest(jsonBody);
		// Generate signature
		const signature = generateSignature(clientId, requestId, requestTimestamp, endpointPath, digest);
		const response = await fetch("https://api-sandbox.doku.com/checkout/v1/payment", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Client-Id": clientId,
				"Request-Id": requestId,
				"Request-Timestamp": requestTimestamp,
				Digest: digest,
				Signature: signature,
			},
			body: jsonBody,
		});
		const result = await response.json();
		if (result.response.payment.url) {
			transactionService.transaction(data, code);
		}

		log.createSuccess(accountId, "Transaction");
		ApiResponse.sendSuccess(res, result.response.payment.url, StatusCodes.CREATED);
	} catch (error) {
		// console.error("Payment error:", error);
		log.createFailed(accountId, "Transaction");
		ApiResponse.sendError(res, { message: (error as Error).message, statusCode: StatusCodes.BAD_REQUEST });
	}
}

async function repaymentController(req: Request, res: Response) {
	const { accountId, firstName, email, lastName } = req.user;
	try {
		const { bookingId } = req.params;
		const data = req.body as IRepaymentRequest;
		const requestId = uuid().toUpperCase();
		const clientId = env.DOKU_CLIENT_ID!;
		const requestTimestamp = new Date().toISOString().split(".")[0] + "Z";
		const endpointPath = "/checkout/v1/payment";
		const exchangeRate = await getExchangeRate();

		const countCode = await prisma.booking.count({
			where: {
				id: bookingId,
			},
		});
		if (countCode !== 1) throw new ApiError(StatusCodes.NOT_FOUND, "Booking code is not found!");
		const items = [
			{
				name: `Full Payment: ${bookingId}`,
				quantity: 1,
				price: Math.floor(Number(data.amountPayment) * exchangeRate),
				type: "Full Payment",
			},
		];

		const payload = {
			order: {
				client_id: clientId,
				invoice_number: requestId,
				amount: Math.floor(Number(data.amountPayment) * exchangeRate),
				currency: "IDR",
				callback_url: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/callback?code=${bookingId}`,
				callback_url_cancel: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/cancel?code=${bookingId}`,
				callback_url_result: `${env.BASE_URL}:${env.PORT}/api/v1/transaction/result?code=${bookingId}`,
				language: "EN",
				auto_redirect: true,
				disable_retry_payment: true,
				line_items: items,
			},
			customer: {
				id: accountId,
				name: firstName,
				last_name: lastName || "",
				email: email,
			},
			payment: {
				payment_due_date: 60,
				type: "SALE",
				payment_method_types: ["VIRTUAL_ACCOUNT_BCA", "VIRTUAL_ACCOUNT_BANK_MANDIRI", "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI", "VIRTUAL_ACCOUNT_DOKU", "VIRTUAL_ACCOUNT_BRI", "VIRTUAL_ACCOUNT_BNI", "VIRTUAL_ACCOUNT_BANK_PERMATA", "VIRTUAL_ACCOUNT_BANK_CIMB", "VIRTUAL_ACCOUNT_BANK_DANAMON", "ONLINE_TO_OFFLINE_ALFA", "CREDIT_CARD", "DIRECT_DEBIT_BRI", "EMONEY_SHOPEEPAY", "EMONEY_OVO", "QRIS", "PEER_TO_PEER_AKULAKU", "PEER_TO_PEER_KREDIVO", "PEER_TO_PEER_INDODANA"],
			},
		};

		// Generate digest
		const jsonBody = JSON.stringify(payload, null, 0);
		const digest = generateDigest(jsonBody);
		// Generate signature
		const signature = generateSignature(clientId, requestId, requestTimestamp, endpointPath, digest);
		const response = await fetch("https://api-sandbox.doku.com/checkout/v1/payment", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Client-Id": clientId,
				"Request-Id": requestId,
				"Request-Timestamp": requestTimestamp,
				Digest: digest,
				Signature: signature,
			},
			body: jsonBody,
		});

		const result = await response.json();

		if (result.response.payment.url) {
			transactionService.repayment(data, bookingId, requestId);
		} else {
			throw Error;
		}

		log.updateSuccess(accountId, "Transaction");
		ApiResponse.sendSuccess(res, result.response.payment.url, StatusCodes.CREATED);
	} catch (error) {
		// console.error("Payment error:", error);
		log.updateSuccess(accountId, "Transaction");
		console.log(error);
		ApiResponse.sendError(res, { message: (error as Error).message, statusCode: StatusCodes.BAD_REQUEST });
	}
}

// Handler untuk webhook DOKU
export async function handleDokuCallback(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { code } = req.query;

		transactionService.successPayment(String(code));
		log.updateSuccess(accountId, "Transaction");
		// ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
		res.redirect(`${env.DASHBOARD_URL}`);
	} catch (error) {
		log.updateFailed(accountId, "Transaction");
		res.redirect(`${env.DASHBOARD_URL}`);
		// ApiResponse.sendError(res, error as Error);
	}
}

// // Handler untuk redirect pembatalan
export async function handleCancelRedirect(req: Request, res: Response) {
	try {
		const { code } = req.query;

		// Update status order
		// await prisma.order.update({
		// 	where: { id: order_id as string },
		// 	data: { status: "CANCELLED" },
		// });

		// res.redirect("/payment-cancelled"); // Redirect ke frontend
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
}

// // Handler untuk redirect hasil akhir
export async function handleResultRedirect(req: Request, res: Response) {
	try {
		const { code } = req.query;

		console.log(code);
		transactionService.successPayment(String(code));
		// ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
		res.redirect(`${env.TRANSACTION_URL}`);
	} catch (error) {
		// ApiResponse.sendError(res, error as Error);
		res.redirect(`${env.TRANSACTION_URL}`);
	}
}
export default { listController, listCruiseController, findController, repaymentController, bookingItineryController, paymentController, handleDokuCallback, handleResultRedirect };
