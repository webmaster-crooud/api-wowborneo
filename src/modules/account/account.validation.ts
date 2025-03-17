import { string, z } from "zod";

export const accountUpdateValidation = z.object({
	body: z.object({
		firstName: z
			.string({
				required_error: "First Name is required!",
			})
			.min(1, "First Name minimum have 1 character")
			.max(100, "First Name maximum have 100 character"),
		lastName: z
			.string({
				message: "Last Name must string value!",
			})
			.min(1, "Last Name minimum have 1 character")
			.max(100, "Last Name maximum have 100 character")
			.optional(),
		phone: z
			.string({
				required_error: "Phone is required!",
			})
			.min(10, "Phone minimum have 10 character")
			.max(15, "Phone maximum have 15 character"),
	}),
});

export const changePasswordValidation = z.object({
	body: z
		.object({
			oldPassword: string({ required_error: "Old Password must have value!" }).min(8, "Old Password must have minimum 8 character"),
			password: z
				.string({
					required_error: "New Password must have value!",
				})
				.min(8, "New Password must have minimum 8 character")
				.max(100, "New Password maximum 100 character"),
			confirmPassword: z.string({
				required_error: "New Confirmation Password must have value!",
			}),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "New Confirmation Password is not valid!",
			path: ["body.confirmPassword"],
		}),
});
