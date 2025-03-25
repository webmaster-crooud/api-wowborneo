import { z } from "zod";
import { sanitizeString } from "../boat.validation";

export const addFacilityValidation = z.object({
	params: z.object({
		boatId: z.string().min(1, "Boat Identify is required"),
	}),
	body: z.object({
		name: sanitizeString("Name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
		icon: z.string().max(100, "Icon must be less than 100 characters").optional(),
	}),
});

export const updateFacilityValidation = z.object({
	params: z.object({
		facilityId: z.string().min(1, "Facility Identify is required"),
	}),
	body: z.object({
		name: sanitizeString("Name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
		icon: z.string().max(100, "Icon must be less than 100 characters").optional(),
	}),
});
