import { sendEmail } from "./libs/mailersend";

export async function testing() {
	try {
		await sendEmail({
			content: "testing",
			email: "mikaeladityan.99@gmail.com",
			firstName: "Mikael",
			lastName: "Aditya Nugroho",
			subject: "Testing Email",
		});
		console.log("Email berhasil dikirim!");
	} catch (error) {
		console.error("Gagal mengirim email:", error);
		process.exit(1); // Keluar dengan kode error
	}
}
