import { StatusCodes } from "http-status-codes";
import prisma from "../../../../configs/database";
import { ApiError } from "../../../../libs/apiResponse";
import { IDeckRequestBody } from "../../../../types/deck";

export const deckService = {
	async countDeck(id: number): Promise<number> {
		return await prisma.deck.count({
			where: {
				id: id,
			},
		});
	},

	async update(deckId: number, body: IDeckRequestBody) {
		const count = await this.countDeck(parseInt(deckId.toString()));
		if (count === 0) throw new ApiError(StatusCodes.NOT_FOUND, "Deck it's not found!");
		await prisma.deck.update({
			where: {
				id: deckId,
			},
			data: {
				title: body.title,
				description: body.description,
			},
		});
	},
};
