import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { validate } from "../../../../middlewares/validate.middleware";
import { addHighlightValidation, updateHighlightValidation } from "./highlight.validation";
import { rateLimiter } from "../../../../utils/rateLimiter";
import highlightController from "./highlight.controller";

export const highlightRoutes = express.Router();

highlightRoutes.post("/:cruiseId", authMiddleware, validate(addHighlightValidation), rateLimiter, highlightController.createController);
highlightRoutes.put("/:id", authMiddleware, validate(updateHighlightValidation), rateLimiter, highlightController.updateController);
highlightRoutes.delete("/:id", authMiddleware, rateLimiter, highlightController.deleteController);
