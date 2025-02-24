import express from "express";
import destinationController from "./destination.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { destinationValidation } from "./destination.validaiton";

export const destinationRoutes = express.Router();

// destinationRoutes.get("/", authMiddleware, destinationController.getController);
destinationRoutes.post("/:cruseId", authMiddleware, validate(destinationValidation), destinationController.createController);
destinationRoutes.put("/:id", authMiddleware, validate(destinationValidation), destinationController.updateController);
destinationRoutes.patch("/:id", authMiddleware, destinationController.actionController);
