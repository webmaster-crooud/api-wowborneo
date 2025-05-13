import Redis from "ioredis";
import { env } from "./env";

export const redisClient = new Redis({
	host: env.REDIS_HOST, // localhost atau 127.0.0.1
	port: env.REDIS_PORT, // 6379
	password: env.NODE_ENV === "production" ? env.REDIS_PASSWORD : "", // kosongkan jika tidak pakai password
	connectTimeout: 5000,
	retryStrategy: (times) => Math.min(times * 100, 3000),
	reconnectOnError: (err) => {
		console.error("Redis error:", err.message);
		return true;
	},
});

// Monitoring events
redisClient.on("ready", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));

export async function testRedisConnection() {
	try {
		const pong = await redisClient.ping();
		console.log("Redis ping:", pong); // => "PONG"
		return true;
	} catch (err) {
		console.error("Redis ping failed:", err);
		return false;
	}
}
