import express from "express";
import cruiseController from "./cruise.controller";
export const homeCruiseRoutes = express.Router();

homeCruiseRoutes.get("/", cruiseController.getPackageCruiseController);
homeCruiseRoutes.get("/minimal", cruiseController.minimal);
homeCruiseRoutes.get("/page", cruiseController.page);
homeCruiseRoutes.get("/:slug", cruiseController.detailCruiseController);
