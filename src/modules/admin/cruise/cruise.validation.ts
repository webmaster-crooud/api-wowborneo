import { z } from "zod";

/* ======================================================================
   Destination Validation (tanpa "body")
   ====================================================================== */
export const destinationValidation = z.object({
	title: z.string({ required_error: "Title of destination is required" }).min(1, "Title of destination: Minimum 1 character").max(100, "Title of destination: Max. 100 characters"),
	description: z.string().max(1000, "Description of destination: Max. 1000 characters").optional().nullable(),
	days: z.string({ message: "Days of destination must be a string" }).max(100, "Days of destination: Max. 100 characters").optional(),
});

/* ======================================================================
   Highlight Validation (tanpa "body")
   ====================================================================== */
export const highlightValidation = z.object({
	title: z.string({ required_error: "Highlight title: Must have value!" }).min(1, "Highlight title: Minimum 1 character").max(100, "Highlight title: Max. 100 characters"),
	description: z.string().max(1000, "Highlight description: Max. 1000 characters").optional().nullable(),
});

/* ======================================================================
   Include Validation (tanpa "body")
   ====================================================================== */
export const includeValidation = z.object({
	title: z.string({ required_error: "Include title: Must have value!" }).min(1, "Include title: Minimum 1 character").max(100, "Include title: Max. 100 characters"),
	description: z.string().max(1000, "Include description: Max. 1000 characters").optional().nullable(),
});

/* ======================================================================
   Information Validation (tanpa "body")
   ====================================================================== */
export const informationValidation = z.object({
	title: z.string({ required_error: "Information title: Must have value!" }).min(1, "Information title: Minimum 1 character").max(100, "Information title: Max. 100 characters"),
	text: z.string().max(1000, "Information text: Max. 1000 characters").optional().nullable(),
});

/* ======================================================================
   Cruise Validation (tanpa nested "body" di array nested)
   ====================================================================== */
export const cruiseValidation = z.object({
	body: z.object({
		slug: z.string().max(100, "Slug: Max. 100 characters").optional(),
		title: z.string({ required_error: "Title: Must have value!" }).min(1, "Title: Minimum 1 character").max(100, "Title: Max. 100 characters"),
		subTitle: z.string().max(100, "Sub Title: Max. 100 characters").optional().nullable(),
		description: z.string().max(1000, "Description: Max. 1000 characters").optional().nullable(),
		derpature: z.string().max(100, "Departure: Max. 100 characters").optional().nullable(),
		informationTitle: z.string().max(100, "Information Title: Max. 100 characters").optional().nullable(),
		InformationText: z.string().max(100, "Information Text: Max. 100 characters").optional().nullable(),
		cta: z.string().max(100, "CTA: Max. 100 characters").optional().nullable(),
		duration: z.string().max(100, "Duration: Max. 100 characters").optional().nullable(),

		// Array validasi untuk destinasi
		destinations: z.array(destinationValidation).optional(),

		// Array validasi untuk highlights (opsional)
		highlights: z.array(highlightValidation).optional(),

		// Array validasi untuk include (opsional)
		include: z.array(includeValidation).optional(),

		// Array validasi untuk informations (opsional)
		informations: z.array(informationValidation).optional(),

		introductionTitle: z.string().max(100, "Introduction Title: Max. 100 characters").optional().nullable(),
		introductionText: z.string().max(1000, "Introduction Text: Max. 1000 characters").optional().nullable(),
		departure: z.string().max(100, "Departure: Max. 100 characters").optional().nullable(),
		status: z.enum(["FAVOURITED", "ACTIVED", "PENDING", "BLOCKED", "DELETED"]),
	}),
});

/* ======================================================================
   Update Cruise Validation
   ====================================================================== */
export const updateCruiseValidation = z.object({
	body: z.object({
		title: z.string({ required_error: "Title: Must have value!" }).min(1, "Title: Minimum 1 character").max(100, "Title: Max. 100 characters"),
		subTitle: z.string().max(100, "Sub Title: Max. 100 characters").optional().nullable(),
		description: z.string().max(1000, "Description: Max. 1000 characters").optional().nullable(),
		derpature: z.string().max(100, "Departure: Max. 100 characters").optional().nullable(),
		duration: z.string().max(100, "Duration: Max. 100 characters").optional().nullable(),
		introductionText: z.string().max(100, "Introduction Text: Max. 100 characters").optional().nullable(),
		introductionTitle: z.string().max(100, "Introduction Title: Max. 100 characters").optional().nullable(),
		cta: z.string().max(100, "Call To Action: Max. 100 characters").optional().nullable(),
	}),
});
