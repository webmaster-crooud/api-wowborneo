import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import agentController from "./agent.controller";

import { agentValidation } from "./agent.validation";
import { validate } from "../../../middlewares/validate.middleware";

export const agentRoutes = express.Router();

agentRoutes.get("/", authMiddleware, agentController.listController);
agentRoutes.post("/", authMiddleware, validate(agentValidation), agentController.createController);
agentRoutes.put("/:id", authMiddleware, validate(agentValidation), agentController.updateController);
agentRoutes.delete("/:accountId", authMiddleware, agentController.deleteController);
