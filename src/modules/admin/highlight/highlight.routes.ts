import express from "express";
import highlightController from "./highlight.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { rateLimiter } from "../../../utils/rateLimiter";
import { addHighlightValidation, updateHighlightValidation } from "./highlight.validation";

export const highlightRoutes = express.Router();

highlightRoutes.post("/:cruiseId", authMiddleware, validate(addHighlightValidation), rateLimiter, highlightController.createController);
highlightRoutes.put("/:id", authMiddleware, validate(updateHighlightValidation), rateLimiter, highlightController.updateController);
highlightRoutes.delete("/:id", authMiddleware, rateLimiter, highlightController.deleteController);
