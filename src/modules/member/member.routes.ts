import express from "express";
import { bookingRoutes } from "./booking/booking.routes";
import { refundRoutes } from "./refund/refund.routes";

export const memberRoutes = express.Router();

memberRoutes.use("/booking", bookingRoutes);
memberRoutes.use("/refund", refundRoutes);
