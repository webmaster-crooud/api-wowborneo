import { z } from "zod";

const cruises = z.object({
	cruiseId: z.string(),
});

export const createPackageSchema = z.object({
	title: z.string({ required_error: "Title is required!" }).max(100, { message: "Title must have maximum 100 character" }),
	description: z.string().optional().nullable(),
	cruises: z.array(cruises),
});
