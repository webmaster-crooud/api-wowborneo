import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import packageController from "./package.controller";
import { validate } from "../../../middlewares/validate.middleware";
import { createPackageSchema } from "./package.validation";

export const packageRoutes = express.Router();

packageRoutes.get("/", authMiddleware, packageController.listPackageController);
packageRoutes.post("/", authMiddleware, validate(createPackageSchema), packageController.listPackageController);
