// prisma/seed.js
import crypt from "bcrypt";
import prisma from "../src/configs/database";
import { env } from "../src/configs/env";
async function main() {
	// Daftar role yang ingin dibuat
	const roles = ["member", "admin", "agent", "owner", "developer"];

	for (const role of roles) {
		// Kita mengupsert data role berdasarkan name (disimpan dengan huruf kapital)
		await prisma.role.upsert({
			where: { name: role },
			update: {},
			create: {
				name: role,
				createdAt: new Date(),
				description: `${role.charAt(0).toUpperCase() + role.slice(1)} Role`,
			},
		});
		console.log(`Role ${role.toUpperCase()} berhasil diproses`);
	}

	console.log("Semua role berhasil diset!");

	const countAcc = await prisma.account.count({
		where: {
			roleId: 2,
			status: "ACTIVED",
			user: {
				status: "ACTIVED",
			},
		},
	});

	if (countAcc === 0) {
		const password = "adminTesting123";
		const now = new Date();
		const salt = await crypt.genSalt(parseInt(env.BCRYPT_ROUND));
		const newPassword = crypt.hashSync(password, parseInt(salt));
		await prisma.user.create({
			data: {
				email: "admin@wowborneo.com",
				firstName: "Admin",
				lastName: "Wow Borneo",
				phone: "",
				status: "ACTIVED",
				createdAt: now,
				updatedAt: now,
				account: {
					create: {
						email: "admin@wowborneo.com",
						password: newPassword,
						ip: "::1",
						userAgent: "Windows",
						createdAt: now,
						updatedAt: now,
						roleId: 2,
						status: "ACTIVED",
					},
				},
			},
		});
	}

	console.log("Create Account berhasil dijalankan");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
