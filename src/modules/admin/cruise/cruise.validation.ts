import { z } from "zod";
import { cruiseDestinationsValidation } from "../destination/destination.validaiton";

export const imageCruiseValidation = z.object({
	imageType: z.enum(["COVER", "PHOTO"]),
	alt: z.string().max(100, "alt: Max. 100 character"),
	description: z.string().max(1000, "Description: Max.1000 character"),
	source: z.string({ required_error: "Source: Must have value!" }),
	filename: z.string({ required_error: "Filename: Must have value!" }),
	mimetype: z.string({ required_error: "Mimetype: Must have value!" }),
	size: z.string({ required_error: "Size: Must have value!" }),
});

export const cruiseValidation = z.object({
	body: z.object({
		slug: z.string().max(100, "Slug: Max. 100 character").optional(),
		title: z.string({ required_error: "Title: Must have value!" }).max(100, "Title: Max. 100 character").min(1, "Title: Min. 1 charackter"),
		subTitle: z.string().max(100, "Sub Title: Max. 100 character").optional(),
		description: z.string().max(1000, "Description: Max. 1000 character").optional(),
		derpature: z.string().max(100, "Description: Max. 100 character").optional(),
		duration: z.string().max(100, "Description: Max. 100 character").optional(),
		destinations: z.array(cruiseDestinationsValidation),
	}),
});

export const updateCruiseValidation = z.object({
	body: z.object({
		slug: z.string().max(100, "Slug: Max. 100 character").optional(),
		title: z.string({ required_error: "Title: Must have value!" }).max(100, "Title: Max. 100 character").min(1, "Title: Min. 1 charackter"),
		subTitle: z.string().max(100, "Sub Title: Max. 100 character").optional(),
		description: z.string().max(1000, "Description: Max. 1000 character").optional(),
		derpature: z.string().max(100, "Description: Max. 100 character").optional(),
		duration: z.string().max(100, "Description: Max. 100 character").optional(),
	}),
});
