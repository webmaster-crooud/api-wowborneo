import { createClient } from "redis";
import { env } from "./env";

export const redisClient = createClient({
	url: env.REDIS_URL,
	socket: {
		tls: env.NODE_ENV === "production",
		rejectUnauthorized: env.NODE_ENV === "production",
		servername: env.NODE_ENV === "production" ? "api.prooyek.com" : "localhost",
	},
	password: env.REDIS_PASSWORD,
});
