import { z } from "zod";

export const destinationValidation = z.object({
	body: z.object({
		title: z.string({ required_error: "Title must have value!" }).min(1).max(100),
		description: z.string().max(1000, "Description has max. 1000 character").optional(),
		days: z.string().max(100).optional(),
		imageCover: z.string().optional(),
		alt: z.string().max(100, "ALT Image has max. 100 character"),
	}),
});

export const cruiseDestinationsValidation = z.object({
	title: z.string({ required_error: "Title must have value!" }).min(1).max(100),
	description: z.string().max(1000, "Description has max. 1000 character").optional(),
	days: z.string().max(100).optional(),
	imageCover: z.string().optional(),
	alt: z.string().max(100, "ALT Image has max. 100 character"),
});
