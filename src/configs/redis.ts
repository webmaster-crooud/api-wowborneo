import Redis from "ioredis";
import { env } from "./env";
import fs from "fs";

export const redisClient = new Redis({
	// Konfigurasi dasar
	host: env.NODE_ENV === "production" ? "api.prooyek.com" : "localhost",
	port: 6379,
	password: env.NODE_ENV === "production" ? env.REDIS_PASSWORD : "",

	// Konfigurasi TLS khusus production
	...(env.NODE_ENV === "production" && {
		tls: {
			ca: fs.readFileSync("/etc/redis-certs/chain.pem"),
			servername: "api.prooyek.com",
			rejectUnauthorized: true,
		},
	}),

	// Opsi optimisasi koneksi
	connectTimeout: 5000,
	retryStrategy: (times: number) => Math.min(times * 100, 3000),
	reconnectOnError: (err: Error) => {
		console.error("Redis connection error:", (err as Error).message);
		return true; // Auto-reconnect
	},
});

// Event handler untuk monitoring
redisClient.on("ready", () => console.log("Redis connected"));
redisClient.on("error", (err: Error) => console.error("Redis error:", err as Error));

// Fungsi test koneksi
export async function testRedisConnection() {
	try {
		const pong = await redisClient.ping();
		console.log("Redis ping response:", pong); // Harusnya "PONG"
		return true;
	} catch (err: unknown) {
		console.error("Redis connection test failed:", err);
		return false;
	}
}
