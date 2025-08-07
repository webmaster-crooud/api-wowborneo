import express, { Request, Response, NextFunction } from "express";
import { boatController } from "./boat.controller";

export const boatRoutes = express.Router();

boatRoutes.get("/", boatController.list);
boatRoutes.get("/page", boatController.page);
boatRoutes.get("/minimal", boatController.minimal);
boatRoutes.get("/:slug", (req: Request, res: Response, next: NextFunction) => {
    boatController.detail(req, res, next);
});
