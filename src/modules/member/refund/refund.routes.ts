import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import refundController from "./refund.controller";
import { validate } from "../../../middlewares/validate.middleware";
import { createRefundSchema } from "./refund.validation";

export const refundRoutes = express.Router();

refundRoutes.get("/:bookingId", authMiddleware, refundController.getRefundAmountController);
refundRoutes.get("/:bookingId/list", authMiddleware, refundController.getBookingRefundController);
refundRoutes.post("/:bookingId", authMiddleware, validate(createRefundSchema), refundController.createController);
