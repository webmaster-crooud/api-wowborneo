import { z } from "zod";

export const authRegisterValidation = z.object({
	body: z
		.object({
			firstName: z
				.string({
					required_error: "Nama depan tidak boleh kosong!",
				})
				.min(1, "Nama depan harus lebih dari 1 karakter")
				.max(100, "Nama depan maksimal 100 karakter"),
			email: z
				.string({
					required_error: "Email tidak boleh kosong",
				})
				.email("Kesalahan format email"),
			phone: z
				.string({
					required_error: "Phone tidak boleh kosong",
				})
				.min(10, "Nomor Telphone/Whatsapp harus lebih dari 10 angka")
				.max(15, "Nomor Telphone/Whatsapp maksimal 10 angka"),
			password: z
				.string({
					required_error: "Password tidak boleh kosong",
				})
				.min(8, "Password minimal memiliki 8 karakter")
				.max(100),
			confirmPassword: z.string({
				required_error: "Konfirmasi password tidak valid",
			}),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Konfirmasi Password tidak valid",
			path: ["body.confirmPassword"],
		}),
});

export const emailVerifyValidation = z.object({
	query: z.object({
		token: z.string().min(1, "Token tidak boleh kosong!").max(1000),
	}),
});
export const resendEmailVerifyValidation = z.object({
	params: z.object({
		email: z.string().min(1, "Email tidak boleh kosong!").email("Kesalahan format email"),
	}),
});

export const forgotPasswordValidation = z.object({
	params: z.object({
		email: z.string().min(1, "Email tidak boleh kosong!").email("Kesalahan format email"),
	}),
});

export const changePassword = z.object({
	body: z
		.object({
			email: z.string().min(1, "Email tidak boleh kosong!").email("Kesalahan format email"),
			token: z.string().min(1, "Token tidak boleh kosong!").max(1000),
			password: z
				.string({
					required_error: "Password tidak boleh kosong",
				})
				.min(8, "Password minimal memiliki 8 karakter")
				.max(100),
			confirmPassword: z.string({
				required_error: "Konfirmasi password tidak valid",
			}),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Konfirmasi Password tidak valid",
			path: ["body.confirmPassword"],
		}),
});

export const loginValidation = z.object({
	body: z.object({
		email: z.string().min(1, "Email tidak boleh kosong!").email("Kesalahan format email"),
		password: z
			.string({
				required_error: "Password tidak boleh kosong",
			})
			.min(8, "Password minimal memiliki 8 karakter")
			.max(100),
	}),
});
