import express from "express";
import cruiseController from "./cruise.controller";
export const homeCruiseRoutes = express.Router();

homeCruiseRoutes.get("/", cruiseController.getPackageCruiseController);
homeCruiseRoutes.get("/:slug", cruiseController.detailCruiseController);
