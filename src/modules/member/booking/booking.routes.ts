import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import bookingController from "./booking.controller";

export const bookingRoutes = express.Router();

bookingRoutes.get("/refund", authMiddleware, bookingController.listRefundController);
bookingRoutes.get("/upcoming", authMiddleware, bookingController.upcomingController);
bookingRoutes.get("/:bookingId", authMiddleware, bookingController.detailController);
bookingRoutes.get("/", authMiddleware, bookingController.listController);
