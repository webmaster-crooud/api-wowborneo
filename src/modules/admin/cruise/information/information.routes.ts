import express from "express";
import informationController from "./information.controller";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { validate } from "../../../../middlewares/validate.middleware";
import { addInformationValidation, updateInformationValidation } from "./information.validation";
import { rateLimiter } from "../../../../utils/rateLimiter";
export const informationRoutes = express.Router();

informationRoutes.post("/:cruiseId", authMiddleware, validate(addInformationValidation), rateLimiter, informationController.createController);
informationRoutes.put("/:id", authMiddleware, validate(updateInformationValidation), rateLimiter, informationController.updateController);
informationRoutes.delete("/:id", authMiddleware, rateLimiter, informationController.deleteController);
