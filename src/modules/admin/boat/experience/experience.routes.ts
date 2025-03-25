import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import experienceController from "./experience.controller";
import { validate } from "../../../../middlewares/validate.middleware";
import { addExperienceValidation, updateExperienceValidation } from "./experience.validation";

export const experienceRoutes = express.Router();

experienceRoutes.post("/:boatId", authMiddleware, validate(addExperienceValidation), experienceController.createController);
experienceRoutes.put("/:experienceId", authMiddleware, validate(updateExperienceValidation), experienceController.updateController);
experienceRoutes.delete("/:experienceId", authMiddleware, experienceController.deleteController);
