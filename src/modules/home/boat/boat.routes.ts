import express from "express";
import { BoatController } from "./boat.controller";

export const boatRoutes = express.Router();

boatRoutes.get("/", BoatController.list);
