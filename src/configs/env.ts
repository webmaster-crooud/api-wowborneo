import { config } from "dotenv";
import { cleanEnv, port, str, url } from "envalid";

config({ path: `.env.${process.env.NODE_ENV || "development"}` });
export const env = cleanEnv(process.env, {
	NODE_ENV: str({ choices: ["development", "production"] }),
	DATABASE_URL: str(),

	BASE_URL: url({ default: "http://localhost" }),
	PORT: port({ default: 3000 }),

	BCRYPT_ROUND: str(),
	SESSION_KEY: str(),

	HOME_URL: str(),
	AUTH_URL: str(),
	TRANSACTION_URL: str(),
	DASHBOARD_URL: str(),

	ACCESS_TOKEN_SECRET: str(),
	REFRESH_TOKEN_SECRET: str(),
	COOKIE_SECRET: str(),
	CORS_ORIGINS: str(),
	MAILERSEND_KEY: str(),
	COMPANY_MAIL: str(),

	S3_BUCKET_NAME: str(),
	S3_ACCESS_KEY: str(),
	S3_SECRET_KEY: str(),
	S3_ENDPOINT: str(),
	S3_REGION: str(),

	DOKU_CLIENT_ID: str(),
	DOKU_SECRET_KEY: str(),
});
