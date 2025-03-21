import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cruiseValidation, updateCruiseValidation } from "./cruise.validation";
import cruiseController from "./cruise.controller";
import { rateLimiter } from "../../../utils/rateLimiter";

export const cruiseRoutes = express.Router();
cruiseRoutes.post("/", authMiddleware, validate(cruiseValidation), rateLimiter, cruiseController.createController);
cruiseRoutes.get("/", authMiddleware, cruiseController.getController);
cruiseRoutes.put("/:cruiseId", authMiddleware, validate(updateCruiseValidation), rateLimiter, cruiseController.updateController);
cruiseRoutes.patch("/:cruiseId", authMiddleware, rateLimiter, cruiseController.actionController);
cruiseRoutes.get("/:cruiseId", authMiddleware, cruiseController.findController);
