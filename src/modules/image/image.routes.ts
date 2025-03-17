import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createImageController, createMultipleImagesController, deleteImageController, updateImageController } from "./image.controller";
import { S3 } from "../../middlewares/s3";
export const imageRoutes = express.Router();

imageRoutes.post("/", authMiddleware, S3.single("file"), createImageController);
imageRoutes.post("/multiple", authMiddleware, S3.array("files"), createMultipleImagesController);
imageRoutes.delete("/:id", deleteImageController);
imageRoutes.put("/:id", S3.single("image"), updateImageController);
