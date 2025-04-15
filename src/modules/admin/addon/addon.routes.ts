import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { actionAddonSchema, createAddonSchema, updateAddonSchema } from "./addon.validation";
import addonController from "./addon.controller";
import { S3 } from "../../../middlewares/s3";

export const addonRoutes = express.Router();

addonRoutes.post("/", authMiddleware, validate(createAddonSchema), S3.single("file"), addonController.createController);
addonRoutes.get("/", authMiddleware, addonController.listController);
addonRoutes.get("/pending", authMiddleware, addonController.listPendingController);
addonRoutes.put("/:addonId", authMiddleware, validate(updateAddonSchema), addonController.updateController);
addonRoutes.patch("/:addonId", authMiddleware, validate(actionAddonSchema), addonController.actionController);
