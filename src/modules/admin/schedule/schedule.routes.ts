import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { addScheduleSchema, updateScheduleSchema } from "./schedule.validation";
import scheduleController from "./schedule.controller";

export const scheduleRoutes = express.Router();

scheduleRoutes.get("/", authMiddleware, scheduleController.listController);
scheduleRoutes.get("/deleted", authMiddleware, scheduleController.listDeletedController);
scheduleRoutes.post("/", authMiddleware, validate(addScheduleSchema), scheduleController.createController);
scheduleRoutes.put("/:scheduleId", authMiddleware, validate(updateScheduleSchema), scheduleController.updateController);
scheduleRoutes.get("/:scheduleId", authMiddleware, scheduleController.findController);
scheduleRoutes.patch("/:scheduleId", authMiddleware, scheduleController.actionController);
