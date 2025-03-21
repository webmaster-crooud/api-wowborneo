import { z } from "zod";

export const destinationValidation = z.object({
	title: z.string({ required_error: "Title of destination is required" }).min(1).max(100),
	description: z.string().max(1000, "Description of destination has max. 1000 character").optional(),
	days: z.string({ message: "Days of destination must be string" }).max(100).optional(),
	status: z.string({ message: "Days of destination must be string" }).max(100),
});

export const addDestinationValidation = z.object({
	body: z.object({
		destinations: z.array(destinationValidation).optional(),
	}),
});

export const updateDestinationValidation = z.object({
	params: z.object({
		id: z.number({ required_error: "Identify of destination is required!" }),
	}),
	body: z.object({
		title: z.string({ required_error: "Title of destination is required" }).min(1).max(100),
		description: z.string().max(1000, "Description of destination has max. 1000 character").optional(),
		days: z.string({ message: "Days of destination must be string" }).max(100).optional(),
		status: z.string({ message: "Days of destination must be string" }).max(100),
	}),
});
