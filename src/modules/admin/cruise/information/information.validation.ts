import { z } from "zod";

export const informationValidation = z.object({
	title: z.string({ required_error: "Title is required" }).min(1).max(100),
	text: z.string().max(2000, "Text has max. 2000 characters").optional(),
	status: z.string({ message: "Status must be string" }).max(100),
});

export const addInformationValidation = z.object({
	body: z.object({
		title: z.string({ required_error: "Title is required" }).min(1).max(100),
		text: z.string().max(2000, "Text has max. 2000 characters").optional(),
	}),
});

export const updateInformationValidation = z.object({
	params: z.object({
		id: z.string({ required_error: "Information ID is required!" }),
	}),
	body: z.object({
		title: z.string({ required_error: "Title is required" }).min(1).max(100),
		text: z.string().max(2000, "Text has max. 2000 characters").optional(),
	}),
});
