import crypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { ChangePasswordInterface, LoginInterface, RegisterInterface } from "../../types/auth";
import prisma from "../../configs/database";
import { ApiError } from "../../libs/apiResponse";
import { env } from "../../configs/env";
import { formatIndonesia, formatUnix } from "../../libs/moment";
import { generateAccessToken, generateRefreshToken, PayloadGenerateJWTToken } from "../../libs/jwt";

// Jangan lupa tambahkan max attempt
async function register(body: RegisterInterface, ip: string | undefined, userAgent: string) {
	const checkUser = await prisma.user.findFirst({
		where: {
			OR: [{ email: body.email }, { phone: body.phone }],
		},
		select: {
			email: true,
			phone: true,
		},
	});
	if (checkUser) throw new ApiError(StatusCodes.BAD_REQUEST, `Email atau Telphone telah terdaftar, silahkan gunakan email atau no. telphone/whatsapp lainnya`);

	const now = new Date();
	const salt = await crypt.genSalt(parseInt(env.BCRYPT_ROUND));
	const newPasswprd = crypt.hashSync(body.password, parseInt(salt));
	const otp = Math.floor(100000 + Math.random() * 900000).toString();

	const result = await prisma.user.create({
		data: {
			firstName: body.firstName,
			lastName: body.lastName,
			email: body.email,
			phone: body.phone,
			status: "PENDING",
			createdAt: now,
			updatedAt: now,
			account: {
				create: {
					email: body.email,
					ip: ip || "",
					userAgent: userAgent,
					password: newPasswprd,
					createdAt: now,
					updatedAt: now,
					role: {
						connect: {
							name: "member",
						},
					},
					emailVerify: {
						create: {
							token: otp,
							createdAt: now,
							updatedAt: now,
							expiredAt: new Date(now.getTime() + 5 * 60 * 1000),
						},
					},
				},
			},
		},
		select: {
			email: true,
			phone: true,
			firstName: true,
			lastName: true,
			account: {
				select: {
					emailVerify: {
						select: {
							token: true,
						},
						where: {
							type: "REGISTER",
						},
						take: 1,
						orderBy: {
							createdAt: "desc",
						},
					},
				},
				where: {
					email: body.email,
				},
			},
		},
	});

	// const content = OTPSenderTemplate({
	//     firstName: result.firstName,
	//     otp: otp,
	//     companyName: 'Laborare Indonesia',
	// });
	// await emailService({
	//     email: result.email,
	//     firstName: result.firstName,
	//     lastName: result.lastName || '',
	//     subject: 'Verifikasi Pendafataran Member',
	//     contentHtml: content,
	// });

	// const message = `Kode verifikasi pendaftaran: \n\n*${result.account?.emailVerify[0].token}* \n\n*Laborare Indonesia*\n_https://laborare.my.id_`;
	// await whatsappSenderOTP(result.phone, message);
	return { result };
}

async function emailVerify(token: string) {
	const account = await prisma.emailVerify.findFirst({
		where: {
			token: token,
		},
		select: {
			token: true,
			expiredAt: true,
			accounts: {
				select: {
					email: true,
					status: true,
				},
			},
		},
	});

	if (!account) {
		throw new ApiError(StatusCodes.BAD_REQUEST, "Email verifikasi gagal!");
	} else {
		if (account.accounts.status === "ACTIVED") throw new ApiError(StatusCodes.BAD_REQUEST, "Akun anda telah aktif!");
		const now = formatUnix(new Date());
		const expiredAt = formatUnix(account.expiredAt);
		if (now > expiredAt) throw new ApiError(StatusCodes.REQUEST_TIMEOUT, "Email Verifikasi telah expired, silahkan kirim aktivasi email kembali!");
		else
			await prisma.account.update({
				where: {
					email: account.accounts.email,
				},
				data: {
					status: "ACTIVED",
					updatedAt: new Date(),
					user: {
						update: {
							status: "ACTIVED",
							updatedAt: new Date(),
						},
					},
				},
			});
		await prisma.emailVerify.delete({
			where: {
				token: token,
			},
		});
	}
}

async function resendEmailVerify(email: string) {
	const account = await prisma.account.findUnique({
		where: {
			email: email,
			emailVerify: {
				some: {
					type: "REGISTER",
				},
			},
		},
		select: {
			status: true,
			emailVerify: {
				select: {
					id: true,
					expiredAt: true,
					token: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});

	if (!account) {
		throw new ApiError(StatusCodes.NOT_FOUND, "Email tidak ditemukan!");
	}

	if (!account.emailVerify || account.emailVerify.length === 0) {
		throw new ApiError(StatusCodes.BAD_REQUEST, "Tidak ada token verifikasi yang ditemukan untuk email ini!");
	}

	if (account.status === "ACTIVED") throw new ApiError(StatusCodes.BAD_REQUEST, "Akun anda telah aktif!");

	if (formatUnix(account.emailVerify[0].expiredAt) > formatUnix(new Date())) throw new ApiError(StatusCodes.BAD_REQUEST, `Kode OTP dapat dikirim kembali pada: ${formatIndonesia(account.emailVerify[0].expiredAt)}`);
	const emailVerifyId = account.emailVerify[0].id;

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const result = await prisma.emailVerify.update({
		where: {
			id: emailVerifyId,
			token: account.emailVerify[0].token,
		},
		data: {
			token: otp,
			expiredAt: new Date(new Date().getTime() + 5 * 60 * 1000),
		},
		include: {
			accounts: {
				select: {
					user: {
						select: {
							phone: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
				},
			},
		},
	});

	const emailUser = result.accounts.user.email;
	const firstName = result.accounts.user.firstName;
	const lastName = result.accounts.user.lastName || "";

	// const content = OTPSenderTemplate({
	// 	firstName: firstName,
	// 	otp: otp,
	// 	companyName: "Laborare Indonesia",
	// });
	// await emailService({
	// 	email: emailUser,
	// 	firstName: firstName,
	// 	lastName: lastName,
	// 	subject: "Verifikasi Pendafataran Member",
	// 	contentHtml: content,
	// });
	// const message = `Kode verifikasi pendaftaran: \n\n*${otp}* \n\n*Laborare Indonesia*\n_https://laborare.my.id_`;
	// await whatsappSenderOTP(result.accounts.user.phone, message);
}

async function forgotPassword(email: string) {
	const checkAccount = await prisma.account.findUnique({
		where: {
			email: email,
		},
		select: {
			id: true,
			email: true,
			status: true,
			user: {
				select: {
					phone: true,
				},
			},
		},
	});

	if (!checkAccount) {
		throw new ApiError(StatusCodes.NOT_FOUND, "Akun tidak ditemukan!");
	}

	switch (checkAccount.status) {
		case "BLOCKED":
			throw new ApiError(StatusCodes.BAD_REQUEST, "Akun tidak Aktif atau telah di blokir! Silahkan hubungi Customer Service kami untuk pengajuan banding.");
		case "PENDING":
			throw new ApiError(StatusCodes.BAD_REQUEST, `Akun tidak Aktif atau belum melakukan verifikasi, silahkan melakukan verifikasi email.\nLINK: ${env.HOME_URL}/register/verify/${email}`);
		case "DELETED":
			throw new ApiError(StatusCodes.BAD_REQUEST, `Akun tidak Aktif atau telah dihapus, silahkan hubungi Customer Service kami untuk mengaktifkan kembali akun anda.`);
		default:
			break;
	}

	const now = new Date();
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const result = await prisma.emailVerify.create({
		data: {
			token: otp,
			accountId: checkAccount.id,
			type: "FORGOT_PASSWORD",
			createdAt: now,
			updatedAt: now,
			expiredAt: new Date(now.getTime() + 5 * 60 * 1000),
		},
		select: {
			accounts: {
				select: {
					user: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
						},
					},
				},
			},
		},
	});

	const redirect = `${env.HOME_URL}/reset-password/${checkAccount.email}?token=${otp}&notification=${encodeURIComponent("Silahkan masukan password baru anda")}`;

	const emailUser = result.accounts.user.email;
	const firstName = result.accounts.user.firstName;
	const lastName = result.accounts.user.lastName || "";

	// const content = ForgotPasswordTemplate({
	// 	firstName: firstName,
	// 	link: redirect,
	// 	companyName: "Laborare Indonesia",
	// });
	// await emailService({
	// 	email: emailUser,
	// 	firstName: firstName,
	// 	lastName: lastName,
	// 	subject: "Verifikasi Pendafataran Member",
	// 	contentHtml: content,
	// });

	// const message = `Berikut link untuk melakukan lupa password: \n\n${redirect} \n\n*Laborare Indonesia*\n_https://laborare.my.id_`;
	// await whatsappSenderOTP(checkAccount.user.phone, message);
}

async function changePassword(body: ChangePasswordInterface) {
	const account = await prisma.account.findFirst({
		where: {
			email: body.email,
			emailVerify: {
				some: {
					token: body.token,
					type: "FORGOT_PASSWORD",
				},
			},
		},
		select: {
			email: true,
			password: true,
			status: true,
			emailVerify: {
				select: {
					token: true,
					type: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 1,
			},
		},
	});

	if (!account) throw new ApiError(StatusCodes.NOT_FOUND, "Akun tidak ditemukan!");
	if (account.emailVerify[0].type !== "FORGOT_PASSWORD") throw new ApiError(StatusCodes.BAD_REQUEST, "Lupa password gagal dilakukan!");
	switch (account.status) {
		case "BLOCKED":
			throw new ApiError(StatusCodes.BAD_REQUEST, "Akun tidak Aktif atau telah di blokir! Silahkan hubungi Customer Service kami untuk pengajuan banding.");
		case "PENDING":
			throw new ApiError(StatusCodes.BAD_REQUEST, `Akun tidak Aktif atau belum melakukan verifikasi, silahkan melakukan verifikasi email.\nLINK: ${env.HOME_URL}/register/verify/${account.email}`);
		case "DELETED":
			throw new ApiError(StatusCodes.BAD_REQUEST, `Akun tidak Aktif atau telah dihapus, silahkan hubungi Customer Service kami untuk mengaktifkan kembali akun anda.`);
		default:
			break;
	}

	const salt = await crypt.genSalt(parseInt(env.BCRYPT_ROUND));
	const newPassword = crypt.hashSync(body.password, parseInt(salt));
	await prisma.account.update({
		where: {
			email: body.email,
			emailVerify: {
				some: {
					token: body.token,
					type: "FORGOT_PASSWORD",
				},
			},
		},
		data: {
			password: newPassword,
			updatedAt: new Date(),
		},
	});
	await prisma.emailVerify.delete({
		where: {
			token: body.token,
		},
	});
}

async function login(body: LoginInterface) {
	const account = await prisma.account.findUnique({
		where: {
			email: body.email,
		},
		select: {
			id: true,
			email: true,
			status: true,
			password: true,
			role: {
				select: {
					name: true,
				},
			},
			user: {
				select: {
					email: true,
					firstName: true,
					lastName: true,
					status: true,
				},
			},
		},
	});

	if (!account) throw new ApiError(StatusCodes.NOT_FOUND, "Login gagal, Periksa email/password anda.");
	if (account.status && account.user.status === "BLOCKED") throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Akun telah terblokir oleh sistem, hubungi Customer Service kami!");

	// Checked Hashing
	const checkPassword = await crypt.compare(body.password, account.password || "");
	if (!checkPassword) throw new ApiError(StatusCodes.BAD_REQUEST, "Login gagal, Periksa email/password anda.");

	// Generate accessToken dan refreshToken
	const payload: PayloadGenerateJWTToken = {
		accountId: account.id,
		email: account.email,
		firstName: account.user.firstName,
		lastName: account.user.lastName || "",
		roleName: account.role.name,
	};
	const accessToken = generateAccessToken(payload);
	const refreshToken = await generateRefreshToken(payload);

	return { account, accessToken, refreshToken };
}

async function refreshToken(refreshToken: string) {
	const checkRefreshToken = await prisma.accountRefreshToken.findFirst({
		where: { token: refreshToken },
		select: {
			account: {
				select: {
					id: true,
					email: true,
					status: true,
					user: {
						select: {
							firstName: true,
							lastName: true,
							status: true,
						},
					},
					role: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

	if (!checkRefreshToken) throw new ApiError(StatusCodes.NOT_FOUND, "Login gagal, Periksa email/password anda.");
	if (checkRefreshToken.account.status && checkRefreshToken.account.user.status === "BLOCKED") throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Akun telah terblokir oleh sistem, hubungi Customer Service kami!");

	// Generate accessToken dan refreshToken
	const payload: PayloadGenerateJWTToken = {
		accountId: checkRefreshToken.account.id,
		email: checkRefreshToken.account.email,
		firstName: checkRefreshToken.account.user.firstName,
		lastName: checkRefreshToken.account.user.lastName || "",
		roleName: checkRefreshToken.account.role.name,
	};
	const accessToken = generateAccessToken(payload);

	return { accessToken };
}

async function getAccount(accountId: string) {
	return await prisma.account.findFirst({
		where: {
			id: accountId,
		},
		select: {
			id: true,
			email: true,
			role: {
				select: {
					name: true,
				},
			},
			user: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
	});
}

export default {
	register,
	emailVerify,
	resendEmailVerify,
	forgotPassword,
	changePassword,
	login,
	refreshToken,
	getAccount,
};
