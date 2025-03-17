import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import accountController from "./account.controller";
import { validate } from "../../middlewares/validate.middleware";
import { accountUpdateValidation, changePasswordValidation } from "./account.validation";

export const accountRouter = express.Router();

accountRouter.get("/", authMiddleware, accountController.findController);
accountRouter.put("/", authMiddleware, validate(accountUpdateValidation), accountController.updateController);
accountRouter.patch("/", authMiddleware, validate(changePasswordValidation), accountController.changePasswordController);
accountRouter.get("/check-photo", authMiddleware, validate(accountUpdateValidation), accountController.checkPhotoController);
