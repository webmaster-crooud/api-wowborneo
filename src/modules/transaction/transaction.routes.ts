import express from "express";
import transactionController from "./transaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { transactionSchema } from "./transaction.validation";
import { validate } from "../../middlewares/validate.middleware";

export const transactionRoutes = express.Router();
transactionRoutes.get("/", transactionController.listController);
transactionRoutes.get("/cruise", transactionController.listCruiseController);

transactionRoutes.get("/result", transactionController.handleResultRedirect);
transactionRoutes.get("/callback", transactionController.handleDokuCallback);
transactionRoutes.get("/:scheduleId", transactionController.findController);

transactionRoutes.post("/:scheduleId", authMiddleware, transactionController.paymentController);
transactionRoutes.post("/:bookingId/repayment", authMiddleware, transactionController.repaymentController);

transactionRoutes.get("/booking/:cabinId/:scheduleId", authMiddleware, transactionController.bookingItineryController);
