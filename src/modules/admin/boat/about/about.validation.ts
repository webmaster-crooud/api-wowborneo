import { z } from "zod";
// Helper validations
const sanitizeString = (fieldName: string) =>
	z
		.string({ message: `${fieldName} must be string` })
		.min(1, `${fieldName} is required`)
		.max(100, `${fieldName} must be less than 100 characters`)
		.trim();
export const addAboutValidation = z.object({
	params: z.object({
		boatId: z.string().min(1, "Boat ID is required"),
	}),
	body: z.object({
		title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional().nullable(),
	}),
});

export const updateAboutValidation = z.object({
	params: z.object({
		aboutId: z.string().min(1, "About ID is required"),
	}),
	body: z.object({
		title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional().nullable(),
	}),
});
