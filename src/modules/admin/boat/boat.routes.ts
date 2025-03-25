import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createBoatValidation, updateBoatValidation } from "./boat.validation";
import { aboutRoutes } from "./about/about.routes";
import { experienceRoutes } from "./experience/experience.routes";
import { facilityRoutes } from "./facilities/facilities.routes";
import boatController from "./boat.controller";
import { cabinRoutes } from "./cabin/cabin.routes";
import { deckRoutes } from "./deck/deck.routes";

export const boatRoutes = express.Router();

boatRoutes.post("/", authMiddleware, validate(createBoatValidation), boatController.createController);
boatRoutes.get("/", authMiddleware, boatController.getController);
boatRoutes.get("/:boatId", authMiddleware, boatController.detailController);
boatRoutes.put("/:boatId", authMiddleware, validate(updateBoatValidation), boatController.updateController);
boatRoutes.patch("/:boatId", authMiddleware, boatController.actionController);

boatRoutes.use("/about", aboutRoutes);
boatRoutes.use("/experience", experienceRoutes);
boatRoutes.use("/facility", facilityRoutes);
boatRoutes.use("/cabin", cabinRoutes);
boatRoutes.use("/deck", deckRoutes);
