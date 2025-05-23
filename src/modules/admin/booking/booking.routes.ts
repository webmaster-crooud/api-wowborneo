import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import bookingController from "./booking.controller";

export const adminBookingRoutes = express.Router();
adminBookingRoutes.get("/", authMiddleware, bookingController.listController);
adminBookingRoutes.get("/:bookingId", authMiddleware, bookingController.detailController);
adminBookingRoutes.patch("/checkin/:bookingId", authMiddleware, bookingController.checkinController);
adminBookingRoutes.patch("/:bookingId/:email", authMiddleware, bookingController.confirmedController);
