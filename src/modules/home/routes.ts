import express from "express";
import homeController from "./home.controller";
import { homeCruiseRoutes } from "./cruise/cruise.routes";
import { boatRoutes } from "./boat/boat.routes";

export const homeRoutes = express.Router();

homeRoutes.get("/navbar", homeController.navbarController);
homeRoutes.get("/", homeController.homePageController);
homeRoutes.use("/cruise", homeCruiseRoutes);
homeRoutes.use("/boat", boatRoutes);
