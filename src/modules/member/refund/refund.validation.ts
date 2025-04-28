import { z } from "zod";

export const createRefundSchema = z.object({
	params: z.object({
		bookingId: z.string({ required_error: "Booking Identity is required!" }).min(1),
	}),
	body: z.object({
		amount: z.string({ required_error: "Amount is required" }),
		amountIDR: z.string({ required_error: "Amount in IDR is required" }),
		percent: z.number({ required_error: "Percent is required" }),
		price: z.string({ required_error: "Percent is required" }),
		reason: z.string({ required_error: "reason is required" }),
		refundMethod: z.string({ required_error: "Refund Method is required" }),
	}),
});
