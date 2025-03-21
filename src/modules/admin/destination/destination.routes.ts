import express from "express";
import destinationController from "./destination.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";

import { rateLimiter } from "../../../utils/rateLimiter";
import { addDestinationValidation, destinationValidation } from "./destination.validation";
import { updateCruiseValidation } from "../cruise/cruise.validation";

export const destinationRoutes = express.Router();

destinationRoutes.get("/", authMiddleware, destinationController.listController);
destinationRoutes.post("/:cruiseId", authMiddleware, validate(addDestinationValidation), rateLimiter, destinationController.createController);
destinationRoutes.put("/:id", authMiddleware, validate(updateCruiseValidation), rateLimiter, destinationController.updateController);
destinationRoutes.patch("/:id", authMiddleware, rateLimiter, destinationController.actionController);
