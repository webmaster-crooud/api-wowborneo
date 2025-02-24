import express from "express";
import { cruiseRoutes } from "./cruise/cruise.routes";
import { destinationRoutes } from "./destination/destination.routes";

export const adminRouter = express.Router();

adminRouter.use("/cruise", cruiseRoutes);
adminRouter.use("/destination", destinationRoutes);
