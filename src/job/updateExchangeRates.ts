import prisma from "../configs/database";
import cron from "node-cron";
async function updateExchangeRate() {
	try {
		await prisma.$connect();
		const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=IDR");
		const data = await response.json();
		const rate = data.rates.IDR;

		await prisma.exchangeRate.upsert({
			where: { id: 1 },
			update: { rate, updatedAt: new Date() },
			create: { rate },
		});
	} catch (error) {
		console.error("Error updating exchange rate:", error);
	} finally {
		await prisma.$disconnect();
	}
}

cron.schedule("0 0 * * *", () => {
	console.log("Running cron job...");
	updateExchangeRate();
});
// Ubah menjadi setiap menit untuk testing (* * * * *)
// cron.schedule("* * * * *", () => {
// 	console.log("Running cron job...");
// 	updateExchangeRate().catch(console.error);
// });

// Tambahkan ini di akhir file untuk test pertama kali
updateExchangeRate()
	.then(() => console.log("Manual update completed"))
	.catch((err) => console.error("Manual update failed:", err))
	.finally(() => prisma.$disconnect());
