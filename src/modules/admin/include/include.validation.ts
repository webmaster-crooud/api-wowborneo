import { z } from "zod";

export const includeValidation = z.object({
	title: z.string({ required_error: "Title is required" }).min(1).max(100),
	description: z.string().max(2000, "Description has max. 2000 characters").optional(),
});

export const addIncludeValidation = z.object({
	body: z.object({
		title: z.string({ required_error: "Title is required" }).min(1).max(100),
		description: z.string().max(2000, "Description has max. 2000 characters").optional(),
	}),
});

export const updateIncludeValidation = z.object({
	params: z.object({
		id: z.string({ required_error: "Include ID is required!" }),
	}),
	body: z.object({
		title: z.string({ required_error: "Title is required" }).min(1).max(100),
		description: z.string().max(2000, "Description has max. 2000 characters").optional(),
	}),
});
