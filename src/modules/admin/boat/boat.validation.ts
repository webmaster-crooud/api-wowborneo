import { z } from "zod";

// Helper validations
export const sanitizeString = (fieldName: string) =>
	z
		.string({ message: `${fieldName} must be string` })
		.min(1, `${fieldName} is required`)
		.max(100, `${fieldName} must be less than 100 characters`)
		.trim();

export const positiveDecimal = (fieldName: string) => z.number().positive(`${fieldName} must be positive`);

// Base validation schemas for related models
export const AboutValidation = z.object({
	title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
	description: z.string({ message: "Description must string!" }).max(2000, "Description must be less than 2000 characters").optional(),
});

const ExperienceValidation = z.object({
	title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
	description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
});

const FacilityValidation = z.object({
	name: sanitizeString("Name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
	description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
	icon: z.string().max(100, "Icon must be less than 100 characters").optional(),
});

const CabinValidation = z.object({
	type: z.enum(["TWIN", "DOUBLE", "SUPER"], {
		errorMap: () => ({ message: "Invalid cabin type. Must be TWIN, DOUBLE, or SUPER" }),
	}),
	name: sanitizeString("Cabin name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
	maxCapacity: z.number().int("Must be integer").positive("Must be positive").max(10, "Max capacity is 10"),
	description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
	price: positiveDecimal("Price"),
});

const DeckValidation = z.object({
	title: sanitizeString("Title").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),
	description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
});

// Main boat validation
export const createBoatValidation = z.object({
	body: z.object({
		name: sanitizeString("Boat name").regex(/^[\w\s-'()]+$/, "Contains invalid characters"),

		slug: z
			.string()
			.max(100, "Slug must be less than 100 characters")
			.regex(/^[a-z0-9-]*$/, "Only lowercase, numbers and hyphens allowed")
			.optional()
			.transform((val) => val || undefined), // Convert empty string to undefined

		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),

		optionText: z.string().max(2000, "Option text must be less than 2000 characters").optional(),

		abouts: z.array(AboutValidation).max(10, "Maximum 10 about entries").optional(),

		experiences: z.array(ExperienceValidation).max(10, "Maximum 10 experience entries").optional(),

		facilities: z
			.array(FacilityValidation)
			.max(20, "Maximum 20 facility entries")
			.refine((items) => new Set(items.map((i) => i.name.toLowerCase())).size === items.length, "Facility names must be unique")
			.optional(),

		cabins: z
			.array(CabinValidation)
			.min(1, "At least 1 cabin required")
			.max(10, "Maximum 10 cabins")
			.refine((items) => new Set(items.map((i) => i.name.toLowerCase())).size === items.length, "Cabin names must be unique"),

		deck: DeckValidation.optional(),
	}),
});

export const updateBoatValidation = z.object({
	params: z.object({
		boatId: z.string().min(1, "Boat ID is required"),
	}),
	body: z.object({
		name: sanitizeString("Boat name")
			.regex(/^[\w\s-'()]+$/, "Contains invalid characters")
			.optional(),

		description: z.string().max(2000, "Description must be less than 2000 characters").optional(),

		optionText: z.string().max(2000, "Option text must be less than 2000 characters").optional(),
	}),
});
