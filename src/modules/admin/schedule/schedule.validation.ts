import { z } from "zod";

export const addScheduleSchema = z.object({
	body: z.object({
		cruiseId: z.string({ required_error: "cruise is required!" }),
		boatId: z.string({ required_error: "boat is required!" }),
		departureAt: z.coerce.date({ required_error: "Date of Event is required" }),
	}),
});

export const updateScheduleSchema = z.object({
	params: z.object({
		scheduleId: z.string({ required_error: "Schedule identify is required!" }),
	}),
	body: z.object({
		cruiseId: z.string({ required_error: "cruise is required!" }),
		boatId: z.string({ required_error: "boat is required!" }),
		departureAt: z.coerce.date({ required_error: "Date of Event is required" }),
	}),
});
