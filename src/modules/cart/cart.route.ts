import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import cartController from "./cart.controller";
import { validate } from "../../middlewares/validate.middleware";
import { setCartSchema } from "./cart.validation";

export const cartRoutes = express.Router();

cartRoutes.post("/:scheduleId", authMiddleware, validate(setCartSchema), cartController.setCartController);
cartRoutes.patch("/addons/:scheduleId", authMiddleware, cartController.setAddonCartController);
cartRoutes.patch("/guest/:scheduleId", authMiddleware, cartController.setGuestCartController);
cartRoutes.patch("/method/:scheduleId", authMiddleware, cartController.setMethodCartController);
cartRoutes.get("/:scheduleId", authMiddleware, cartController.getCartController);
