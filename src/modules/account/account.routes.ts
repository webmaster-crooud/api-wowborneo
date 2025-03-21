import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import accountController from "./account.controller";
import { validate } from "../../middlewares/validate.middleware";
import { accountUpdateValidation, changePasswordValidation } from "./account.validation";
import { rateLimiter } from "../../utils/rateLimiter";

export const accountRouter = express.Router();

accountRouter.get("/", authMiddleware, accountController.findController);
accountRouter.put("/", authMiddleware, validate(accountUpdateValidation), rateLimiter, accountController.updateController);
accountRouter.patch("/", authMiddleware, validate(changePasswordValidation), rateLimiter, accountController.changePasswordController);
accountRouter.get("/check-photo", authMiddleware, rateLimiter, accountController.checkPhotoController);
