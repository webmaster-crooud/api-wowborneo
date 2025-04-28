import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import refundController from "./refund.controller";

export const refundRoutes = express.Router();
refundRoutes.get("/", authMiddleware, refundController.listController);
refundRoutes.get("/:id", authMiddleware, refundController.detailController);
refundRoutes.patch("/:id/:action", authMiddleware, refundController.actionController);
