import { z } from "zod";

export const destinationValidation = z.object({
	body: z.object({
		title: z.string({ required_error: "Title of destination is required" }).min(1).max(100),
		description: z.string().max(1000, "Description of destination has max. 1000 character").optional(),
		days: z.string({ message: "Days of destination must be string" }).max(100).optional(),
	}),
});
