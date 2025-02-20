import { CsrfTokenGenerator } from "csrf-sync";
import { PayloadGenerateJWTToken } from "@/utils/jwt.ts";

declare global {
	namespace Express {
		interface Request {
			user?: PayloadGenerateJWTToken;
			csrfToken: CsrfTokenGenerator;
		}
	}
}
