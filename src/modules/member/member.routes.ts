import express from "express";
import { bookingRoutes } from "./booking/booking.routes";

export const memberRoutes = express.Router();

memberRoutes.use("/booking", bookingRoutes);
