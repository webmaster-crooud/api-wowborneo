import { z } from "zod";

export const highlightValidation = z.object({
	title: z.string({ required_error: "Title of highlight is required" }).min(1).max(100),
	description: z.string().max(1000, "Description of highlight has max. 1000 character").optional(),
});

export const addHighlightValidation = z.object({
	body: z.object({
		highlights: z.array(highlightValidation).optional(),
	}),
});

export const updateHighlightValidation = z.object({
	params: z.object({
		id: z.string({ required_error: "Highlight ID is required!" }),
	}),
	body: z.object({
		title: z.string({ required_error: "Title of highlight is required" }).min(1).max(100),
		description: z.string().max(1000, "Description of highlight has max. 1000 character").optional().nullable(),
	}),
});
