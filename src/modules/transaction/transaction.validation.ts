import { z } from "zod";

export const transactionSchema = z.object({
	body: z.object({
		email: z
			.string({
				required_error: "Email is required",
				invalid_type_error: "Email must be a string",
			})
			.email("Invalid email format"),

		cabinId: z.string({
			required_error: "Cabin ID is required",
			invalid_type_error: "Cabin ID must be a string",
		}),

		scheduleId: z.string({
			required_error: "Schedule ID is required",
			invalid_type_error: "Schedule ID must be a string",
		}),

		pax: z
			.number({
				required_error: "Number of passengers (pax) is required",
				invalid_type_error: "Pax must be a number",
			})
			.int("Pax must be an integer")
			.positive("Pax must be at least 1"),

		addons: z.array(
			z.object({
				id: z
					.number({
						required_error: "Addon ID is required",
						invalid_type_error: "Addon ID must be a number",
					})
					.int("Addon ID must be an integer"),

				qty: z
					.number({
						required_error: "Quantity is required",
						invalid_type_error: "Quantity must be a number",
					})
					.int("Quantity must be an integer")
					.positive("Quantity must be at least 1"),

				price: z
					.string({
						required_error: "Price is required",
						invalid_type_error: "Price must be a string representation of a number",
					})
					.regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
					.nullable(),

				totalPrice: z
					.string({
						required_error: "Total price is required",
						invalid_type_error: "Total price must be a string representation of a number",
					})
					.regex(/^\d+(\.\d{1,2})?$/, "Invalid total price format")
					.nullable(),

				title: z.string({
					required_error: "Addon title is required",
					invalid_type_error: "Title must be a string",
				}),

				description: z.string({
					required_error: "Addon description is required",
					invalid_type_error: "Description must be a string",
				}),
			})
		),

		guests: z.array(
			z.object({
				firstName: z.string({
					required_error: "First name is required",
					invalid_type_error: "First name must be a string",
				}),

				lastName: z
					.string({
						invalid_type_error: "Last name must be a string",
					})
					.nullable(),

				email: z
					.string({
						required_error: "Email is required",
						invalid_type_error: "Email must be a string",
					})
					.email("Invalid email format"),

				phone: z.string({
					required_error: "Phone number is required",
					invalid_type_error: "Phone number must be a string",
				}),

				children: z.boolean({
					required_error: "Children status is required",
					invalid_type_error: "Children must be a boolean",
				}),

				identityNumber: z.string({
					required_error: "Identity number is required",
					invalid_type_error: "Identity number must be a string",
				}),

				country: z.string({
					required_error: "Country is required",
					invalid_type_error: "Country must be a string",
				}),

				document: z.string({
					required_error: "Document is required",
					invalid_type_error: "Document must be a string",
				}),

				signature: z.boolean({
					required_error: "Signature status is required",
					invalid_type_error: "Signature must be a boolean",
				}),

				price: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number string"), z.number()], {
					required_error: "Price is required",
					invalid_type_error: "Price must be a number or numeric string",
				}),
			})
		),

		guestPrice: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Guest price must be a valid number string"), z.number()], {
			required_error: "Guest price is required",
			invalid_type_error: "Guest price must be a number or numeric string",
		}),

		addonPrice: z.string().nullable(),

		price: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number string"), z.number()], {
			required_error: "Price is required",
			invalid_type_error: "Price must be a number or numeric string",
		}),

		subTotal: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Subtotal must be a valid number string"), z.number()], {
			required_error: "Subtotal is required",
			invalid_type_error: "Subtotal must be a number or numeric string",
		}),

		finalTotal: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Final total must be a valid number string"), z.number()], {
			required_error: "Final total is required",
			invalid_type_error: "Final total must be a number or numeric string",
		}),

		discount: z.string().nullable(),

		cruise: z.object({
			title: z.string({
				required_error: "Cruise title is required",
				invalid_type_error: "Cruise title must be a string",
			}),
		}),

		method: z
			.enum(["dp", "full"], {
				required_error: "Payment method is required",
				invalid_type_error: "Payment method must be 'dp' or 'full'",
			})
			.nullable(),

		amountPayment: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Payment amount must be a valid number string"), z.number()], {
			required_error: "Payment amount is required",
			invalid_type_error: "Payment amount must be a number or numeric string",
		}),

		amountUnderPayment: z.union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Underpayment amount must be a valid number string"), z.number()], {
			required_error: "Underpayment amount is required",
			invalid_type_error: "Underpayment amount must be a number or numeric string",
		}),
	}),
});
