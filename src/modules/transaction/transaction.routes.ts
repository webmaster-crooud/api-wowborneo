import express from "express";
import transactionController from "./transaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { transactionSchema } from "./transaction.validation";
import { validate } from "../../middlewares/validate.middleware";

export const transactionRoutes = express.Router();
transactionRoutes.get("/", transactionController.listScheduleController);
transactionRoutes.get("/callback", transactionController.handleDokuCallback);
transactionRoutes.get("/result", transactionController.handleResultRedirect);
transactionRoutes.post("/", authMiddleware, validate(transactionSchema), transactionController.paymentController);
transactionRoutes.post("/:bookingId", authMiddleware, transactionController.repaymentController);

transactionRoutes.get("/:scheduleId", transactionController.findController);
transactionRoutes.get("/booking/:cabinId/:scheduleId", authMiddleware, transactionController.bookingItineryController);
