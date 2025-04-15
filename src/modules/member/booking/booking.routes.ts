import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import bookingController from "./booking.controller";

export const bookingRoutes = express.Router();

bookingRoutes.get("/", authMiddleware, bookingController.listController);
bookingRoutes.get("/:bookingId", authMiddleware, bookingController.detailController);
