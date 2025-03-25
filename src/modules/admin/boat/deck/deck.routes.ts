import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { validate } from "../../../../middlewares/validate.middleware";
import deckController from "./deck.controller";
import { updateDeckValidation } from "./deck.validation";
export const deckRoutes = express.Router();

deckRoutes.put("/:deckId", authMiddleware, validate(updateDeckValidation), deckController.updateController);
