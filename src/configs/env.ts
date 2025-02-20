import { config } from "dotenv";
import { cleanEnv, port, str, url } from "envalid";

config({ path: `.env.${process.env.NODE_ENV || "development"}` });
export const env = cleanEnv(process.env, {
	NODE_ENV: str({ choices: ["development", "production"] }),
	PORT: port({ default: 3000 }),
	DATABASE_URL: str(),
	BASE_URL: url({ default: "http://localhost" }),
	BCRYPT_ROUND: str(),
	SESSION_KEY: str(),
	HOME_URL: str(),
	AUTH_URL: str(),
	ACCESS_TOKEN_SECRET: str(),
	REFRESH_TOKEN_SECRET: str(),
	COOKIE_SECRET: str(),
	CORS_ORIGINS: str(),
});
