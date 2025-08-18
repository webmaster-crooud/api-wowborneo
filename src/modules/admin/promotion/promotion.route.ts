import express from "express";
import { validate } from "../../../middlewares/validate.middleware";
import { promotionSchema, updatePromotionSchema } from "./promotion.validation";
import promotionController from "./promotion.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

export const promotionRoutes = express.Router();

promotionRoutes.get("/", authMiddleware, promotionController.listController);
promotionRoutes.get("/paginated", authMiddleware, promotionController.listPaginatedController);
promotionRoutes.post("/", authMiddleware, validate(promotionSchema), promotionController.createController);
promotionRoutes.put("/:id", authMiddleware, validate(updatePromotionSchema), promotionController.updateController);
promotionRoutes.delete("/:id", authMiddleware, promotionController.deleteController);
