import express from "express";
import { cruiseRoutes } from "./cruise/cruise.routes";
import { destinationRoutes } from "./destination/destination.routes";
import { highlightRoutes } from "./highlight/highlight.routes";
import { informationRoutes } from "./information/information.routes";
import { includeRoutes } from "./include/include.routes";
import { boatRoutes } from "./boat/boat.routes";
import { scheduleRoutes } from "./schedule/schedule.routes";

export const adminRouter = express.Router();

adminRouter.use("/cruise", cruiseRoutes);
adminRouter.use("/destination", destinationRoutes);
adminRouter.use("/highlight", highlightRoutes);
adminRouter.use("/information", informationRoutes);
adminRouter.use("/include", includeRoutes);
adminRouter.use("/boat", boatRoutes);
adminRouter.use("/schedule", scheduleRoutes);
