/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import logger from "../libs/logger";

const prisma = new PrismaClient({
	log: [
		{ level: "warn", emit: "event" },
		{ level: "error", emit: "event" },
		{ level: "query", emit: "event" },
	],
});

prisma.$on("query", (e: any) => {
	logger.debug(`Query: ${e.query}`);
});

prisma.$on("error", (e: any) => {
	logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on("warn", (e: any) => {
	logger.warn(`Prisma Warning: ${e.message}`);
});

export default prisma;
