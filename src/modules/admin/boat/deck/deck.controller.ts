import { Response, Request } from "express";
import { ApiError, ApiResponse } from "../../../../libs/apiResponse";
import { log } from "../../../../utils/logging";
import { StatusCodes } from "http-status-codes";
import { deckService } from "./deck.service";

async function updateController(req: Request, res: Response) {
	const { accountId } = req.user;
	const { deckId } = req.params;
	try {
		const body = req.body;
		await deckService.update(parseInt(deckId), body);
		log.updateSuccess(accountId, `Deck ${deckId}`);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.CREATED);
	} catch (error) {
		log.updateFailed(accountId, `Deck ${deckId}`);
		ApiResponse.sendError(res, error as Error);
	}
}

export default { updateController };
