import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { env } from "../configs/env";

export function generateCode(scheduleId: string): string {
	const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
	return `INV-${scheduleId.toUpperCase()}-${date}-${uuid().slice(0, 8).toUpperCase()}`;
}

export function generateDigest(jsonBody: string): string {
	const minifiedBody = JSON.stringify(JSON.parse(jsonBody));
	const hash = crypto.createHash("sha256").update(minifiedBody, "utf8");
	return hash.digest("base64");
}
export function generateSignature(clientId: string, requestId: string, requestTimestamp: string, requestTarget: string, digest?: string): string {
	// Membuat komponen signature
	// const componentSignature =
	// 	`Client-Id:${clientId}\n` +
	// 	`Request-Id:${requestId}\n` +
	// 	`Request-Timestamp:${requestTimestamp}\n` +
	// 	`Request-Target:${requestTarget}\n` + // Perhatikan garis miring di awal path
	// 	`Digest:${digest}`; // Tanpa newline di akhir

	let componentSignature = `Client-Id:${clientId}\n` + `Request-Id:${requestId}\n` + `Request-Timestamp:${requestTimestamp}\n` + `Request-Target:${requestTarget}`;

	// Jika ada digest (untuk request dengan body)
	if (digest) {
		componentSignature += `\nDigest:${digest}`;
	}
	// console.log("----- Component Signature -----");
	// console.log(componentSignature);
	// console.log("\n");

	// Hitung HMAC-SHA256
	const hmac256Value = crypto.createHmac("sha256", env.DOKU_SECRET_KEY!).update(componentSignature).digest();
	// // Setelah generate signature
	// console.log("----- RAW Signature Components -----");
	// console.log(componentSignature.replace(/\n/g, "\\n")); // Tampilkan newline sebagai escape
	// console.log(`Secret Key: ${env.DOKU_SECRET_KEY?.substring(0, 5)}...`); // Log partial key

	// Bandingkan dengan implementasi manual
	// const manualSignature = crypto.createHmac("sha256", env.DOKU_SECRET_KEY!).update(componentSignature).digest("base64");
	// // console.log("Manual HMAC:", `HMACSHA256=${manualSignature}`);
	return `HMACSHA256=${Buffer.from(hmac256Value).toString("base64")}`;
}
