import winston from "winston";
import { env } from "../configs/env";

const logger = winston.createLogger({
	level: env.NODE_ENV === "development" ? "debug" : "info",
	format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `[${timestamp}] ${level}: ${message}`;
				})
			),
		}),
		new winston.transports.File({ filename: "logs/error.log", level: "error" }),
		new winston.transports.File({ filename: "logs/combined.log" }),
	],
});

export default logger;
