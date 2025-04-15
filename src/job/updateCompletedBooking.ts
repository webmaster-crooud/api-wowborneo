import prisma from "../configs/database";
import bookingService from "../modules/admin/booking/booking.service";
import cron from "node-cron";

async function completeDailySchedules() {
	// 1. Dapatkan tanggal hari ini dalam UTC (00:00:00)
	// Paksa tanggal testing
	// const today = new Date("2025-05-03T00:00:00Z");
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	// 2. Cari semua schedule dengan arrivalAt hari ini
	const schedules = await prisma.schedule.findMany({
		where: {
			arrivalAt: {
				equals: today,
			},
		},
		select: { id: true },
	});

	// 3. Proses setiap schedule menggunakan method completed yang sudah ada
	for (const schedule of schedules) {
		try {
			await bookingService.completed(schedule.id);
			console.log(`✅ Berhasil memproses schedule ${schedule.id}`);
		} catch (error) {
			console.error(`❌ Gagal memproses schedule ${schedule.id}:`, error);
			// Tambahkan logic retry atau notifikasi error jika diperlukan
		}
	}
}

// Jalankan setiap hari jam 00:00 UTC (08:00 WIB)
cron.schedule(
	"0 0 * * *",
	async () => {
		console.log("⏳ Memulai proses completed harian...");
		try {
			await completeDailySchedules();
			console.log("🎉 Proses completed harian selesai");
		} catch (error) {
			console.error("🔥 Error global pada cron job:", error);
		}
	},
	{
		timezone: "UTC", // Wajib UTC sesuai penyimpanan data
	}
);
