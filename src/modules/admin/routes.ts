import express from "express";
import { cruiseRoutes } from "./cruise/cruise.routes";
import { highlightRoutes } from "./cruise/highlight/highlight.routes";
import { informationRoutes } from "./cruise/information/information.routes";
import { boatRoutes } from "./boat/boat.routes";
import { scheduleRoutes } from "./schedule/schedule.routes";
import { memberRoutes } from "./member/member.routes";
import { destinationRoutes } from "./cruise/destination/destination.routes";
import { includeRoutes } from "./cruise/include/include.routes";
import { addonRoutes } from "./addon/addon.routes";
import { adminBookingRoutes } from "./booking/booking.routes";

export const adminRouter = express.Router();

adminRouter.use("/cruise", cruiseRoutes);
adminRouter.use("/destination", destinationRoutes);
adminRouter.use("/highlight", highlightRoutes);
adminRouter.use("/information", informationRoutes);
adminRouter.use("/include", includeRoutes);
adminRouter.use("/boat", boatRoutes);
adminRouter.use("/schedule", scheduleRoutes);
adminRouter.use("/member", memberRoutes);
adminRouter.use("/addon", addonRoutes);
adminRouter.use("/booking", adminBookingRoutes);
