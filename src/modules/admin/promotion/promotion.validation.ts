// promotion.schema.ts
import { z } from "zod";

export const promotionSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Name must have value! min 1 and max 100 character" }).min(1).max(100),
		code: z.string({ required_error: "Code must have value! min 1 and max 100 character" }).min(1).max(100),
		discountType: z.enum(["PERCENT", "CURRENCY"], { required_error: "Discount Type is required" }),
		discountValue: z.coerce.number({ required_error: "Discount Value can't be null" }).positive({ message: "Discount must be positive number" }),
		startDate: z.coerce.date({ required_error: "Start Date must have value" }),
		endDate: z.coerce.date({ required_error: "End Date must have value" }),
	}),
});

export const updatePromotionSchema = z.object({
	body: z.object({
		name: z.string().min(1).max(100),
		discountType: z.enum(["PERCENT", "CURRENCY"]),
		discountValue: z.coerce.number().positive(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
	}),
});
