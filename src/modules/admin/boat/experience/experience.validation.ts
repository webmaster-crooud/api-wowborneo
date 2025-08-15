import { z } from "zod";
// Helper validations
const sanitizeString = (fieldName: string) =>
	z
		.string({ message: `${fieldName} must be string` })
		.min(1, `${fieldName} is required`)
		.max(100, `${fieldName} must be less than 100 characters`)
		.trim();
export const addExperienceValidation = z.object({
	params: z.object({
		boatId: z.string().min(1, "Boat ID is required"),
	}),
	body: z.object({
		title: sanitizeString("Title"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional().nullable(),
	}),
});

export const updateExperienceValidation = z.object({
	params: z.object({
		experienceId: z.string().min(1, "Experience ID is required"),
	}),
	body: z.object({
		title: sanitizeString("Title"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional().nullable(),
	}),
});
