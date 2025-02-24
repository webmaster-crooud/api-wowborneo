import { CsrfTokenGenerator } from "csrf-sync";
import { PayloadGenerateJWTToken } from "../libs/jwt";

declare global {
	namespace Express {
		interface Request {
			user: PayloadGenerateJWTToken;
			csrfToken: CsrfTokenGenerator;
		}
	}
}
