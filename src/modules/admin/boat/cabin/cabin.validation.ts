import { z } from "zod";
import { positiveDecimal, sanitizeString } from "../boat.validation";

export const addCabinValidation = z.object({
	params: z.object({
		boatId: z.string().min(1, "Boat Identify is required"),
	}),
	body: z.object({
		type: z.enum(["TWIN", "DOUBLE", "SUPER"], {
			errorMap: () => ({ message: "Invalid cabin type. Must be TWIN, DOUBLE, or SUPER" }),
		}),
		name: sanitizeString("Cabin name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		maxCapacity: z.number().int("Must be integer").positive("Must be positive").max(10, "Max capacity is 10"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
		price: positiveDecimal("Price"),
	}),
});
export const updateCabinValidation = z.object({
	params: z.object({
		cabinId: z.string().min(1, "Cabin Identify is required"),
	}),
	body: z.object({
		type: z.enum(["TWIN", "DOUBLE", "SUPER"], {
			errorMap: () => ({ message: "Invalid cabin type. Must be TWIN, DOUBLE, or SUPER" }),
		}),
		name: sanitizeString("Cabin name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		maxCapacity: z.number().int("Must be integer").positive("Must be positive").max(10, "Max capacity is 10"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
		price: positiveDecimal("Price"),
	}),
});
