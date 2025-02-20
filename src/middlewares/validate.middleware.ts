import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodEffects } from "zod"; // Impor ZodError
import { ApiError } from "../libs/apiResponse";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validate = (schema: ZodObject<any> | ZodEffects<ZodObject<any>>) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		await schema.parseAsync({
			body: req.body,
			query: req.query,
			params: req.params,
		});
		next();
	} catch (error) {
		console.error(error);
		if (error instanceof ZodError) {
			// Periksa apakah error adalah ZodError
			const errors = error.issues.map((issue) => ({
				message: issue.message,
				path: issue.path.join("."),
			}));
			next(new ApiError(400, "Validation error", errors));
		} else {
			next(error);
		}
	}
};
