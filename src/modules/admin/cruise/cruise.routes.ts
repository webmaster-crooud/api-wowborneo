import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cruiseValidation, updateCruiseValidation } from "./cruise.validation";
import cruiseController from "./cruise.controller";

export const cruiseRoutes = express.Router();
cruiseRoutes.post("/", authMiddleware, validate(cruiseValidation), cruiseController.createController);
cruiseRoutes.get("/", authMiddleware, cruiseController.getController);
cruiseRoutes.put("/:cruiseId", authMiddleware, validate(updateCruiseValidation), cruiseController.updateController);
cruiseRoutes.patch("/:cruiseId", authMiddleware, cruiseController.actionController);
cruiseRoutes.get("/:cruiseId", authMiddleware, cruiseController.findController);
