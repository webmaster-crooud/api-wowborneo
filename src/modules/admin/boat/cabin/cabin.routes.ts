import express from "express";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { validate } from "../../../../middlewares/validate.middleware";
import cabinController from "./cabin.controller";
import { addCabinValidation, updateCabinValidation } from "./cabin.validation";

export const cabinRoutes = express.Router();

cabinRoutes.post("/:boatId", authMiddleware, validate(addCabinValidation), cabinController.createController);
cabinRoutes.put("/:cabinId", authMiddleware, validate(updateCabinValidation), cabinController.updateController);
cabinRoutes.delete("/:cabinId", authMiddleware, cabinController.deleteController);
