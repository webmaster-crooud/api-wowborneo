import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import aboutController from "./about.controller";
import { validate } from "../../../../middlewares/validate.middleware";
import { addAboutValidation, updateAboutValidation } from "./about.validation";

export const aboutRoutes = express.Router();

aboutRoutes.post("/:boatId", authMiddleware, validate(addAboutValidation), aboutController.createController);
aboutRoutes.put("/:aboutId", authMiddleware, validate(updateAboutValidation), aboutController.updateController);
aboutRoutes.delete("/:aboutId", authMiddleware, aboutController.deleteController);
