import { z } from "zod";
import { sanitizeString } from "../boat.validation";

export const updateDeckValidation = z.object({
	params: z.object({
		deckId: z.string().min(1, "About ID is required"),
	}),
	body: z.object({
		title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
	}),
});
