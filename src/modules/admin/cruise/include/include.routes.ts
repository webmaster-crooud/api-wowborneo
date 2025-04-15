import express from "express";
import includeController from "./include.controller";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { rateLimiter } from "../../../../utils/rateLimiter";

export const includeRoutes = express.Router();

includeRoutes.post("/:cruiseId", authMiddleware, rateLimiter, includeController.createController);
includeRoutes.put("/:id", authMiddleware, rateLimiter, includeController.updateController);
includeRoutes.delete("/:id", authMiddleware, rateLimiter, includeController.deleteController);
