import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { validate } from "../../../../middlewares/validate.middleware";
import { addFacilityValidation, updateFacilityValidation } from "./facilities.validation";
import facilitiesController from "./facilities.controller";

export const facilityRoutes = express.Router();

facilityRoutes.post("/:boatId", authMiddleware, validate(addFacilityValidation), facilitiesController.createController);
facilityRoutes.put("/:facilityId", authMiddleware, validate(updateFacilityValidation), facilitiesController.updateController);
facilityRoutes.delete("/:facilityId", authMiddleware, facilitiesController.deleteController);
