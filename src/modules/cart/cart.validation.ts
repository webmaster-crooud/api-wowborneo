import { z } from "zod";

export const setCartSchema = z.object({
	params: z.object({
		scheduleId: z.string({ required_error: "Schedule is required" }).max(150, "Schedule value must have maximum 150 character"),
	}),
	body: z.object({
		cabinId: z.number({ required_error: "Cabin is required" }),
		pax: z.number({ required_error: "Total Pax is reqired" }),
	}),
});
