import express from "express";
import includeController from "./include.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { rateLimiter } from "../../../utils/rateLimiter";
import { addIncludeValidation, updateIncludeValidation } from "./include.validation";

export const includeRoutes = express.Router();

includeRoutes.post("/:cruiseId", authMiddleware, validate(addIncludeValidation), rateLimiter, includeController.createController);
includeRoutes.put("/:id", authMiddleware, validate(updateIncludeValidation), rateLimiter, includeController.updateController);
includeRoutes.delete("/:id", authMiddleware, rateLimiter, includeController.deleteController);
