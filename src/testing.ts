import { sendVerificationEmail } from "./libs/mailersend";

export async function testing() {
	try {
		await sendVerificationEmail("mikaeladityan.99@gmail.com", "100");
		console.log("Email berhasil dikirim!");
	} catch (error) {
		console.error("Gagal mengirim email:", error);
		process.exit(1); // Keluar dengan kode error
	}
}
