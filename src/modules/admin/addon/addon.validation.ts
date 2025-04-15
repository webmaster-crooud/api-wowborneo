import { z } from "zod";
import { positiveDecimal } from "../boat/boat.validation";

export const addonSchema = z.object({
	title: z.string({ required_error: "Addons title is required!" }).max(100, "Addons title maximum has 100 character"),
	description: z.string({ message: "Description must be string" }).max(1000, "Addons description maximum has 1000 character").optional().nullable(),
	cover: z.string({ message: "Cover must be string" }).optional().nullable(),
	price: positiveDecimal("Price"),
});

export const createAddonSchema = z.object({
	body: z.object({ ...addonSchema.shape }),
});

export const updateAddonSchema = z.object({
	params: z.object({
		addonId: z.number({ required_error: "Addon identify is required!" }),
	}),
	body: z.object({ addonSchema }),
});

export const actionAddonSchema = z.object({
	params: z.object({
		addonId: z.string({ required_error: "Addon identify is required!" }),
	}),
	query: z.object({
		action: z.string({ message: "Action is required!" }),
	}),
});
