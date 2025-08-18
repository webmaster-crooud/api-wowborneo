import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import packageController from "./package.controller";
import { validate } from "../../../middlewares/validate.middleware";
import { createPackageSchema } from "./package.validation";

export const packageRoutes = express.Router();

packageRoutes.get("/", authMiddleware, packageController.listPackageController);
packageRoutes.get("/paginated", authMiddleware, packageController.listPackagePaginatedController);
packageRoutes.get("/cruise", authMiddleware, packageController.cruiseListPackageController);
packageRoutes.get("/:id", authMiddleware, packageController.detailPackageController);
packageRoutes.post("/", authMiddleware, validate(createPackageSchema), packageController.createPackageController);
packageRoutes.delete("/:packageId/:cruiseId", authMiddleware, packageController.deleteCruiseController);
packageRoutes.put("/:packageId", authMiddleware, validate(createPackageSchema), packageController.updatePackageController);
