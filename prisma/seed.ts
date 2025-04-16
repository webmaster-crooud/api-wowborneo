// prisma/seed.js

import prisma from "../src/configs/database";
async function main() {
	// Daftar role yang ingin dibuat
	const roles = ["member", "agent", "admin", "owner", "developer"];

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
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
