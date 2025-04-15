import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import memberController from "./member.controller";

export const memberRoutes = express.Router();
memberRoutes.get("/", authMiddleware, memberController.listController);
memberRoutes.patch("/:memberId", authMiddleware, memberController.actionController);
memberRoutes.patch("/role/:memberId", authMiddleware, memberController.changeRoleController);
