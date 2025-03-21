// BACKEND IMAGE CONTROLLER

import { Request, Response } from "express";
import prisma from "../../configs/database";
import { IImage } from "../../types/image";
import { ApiError, ApiResponse } from "../../libs/apiResponse";
import { StatusCodes } from "http-status-codes";
import { deleteS3, uploadS3 } from "../../middlewares/s3";

export async function createImageController(req: Request, res: Response) {
	try {
		const file = req.file;
		const { entityId, imageType, entityType } = req.body;

		if (!file || !entityId || !entityType || !imageType) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Upload file is not valid!");
		}

		// Folder path sesuai dengan entity type
		const folderPath = `${entityType.toLowerCase()}/${imageType.toLowerCase()}`;

		// Upload ke idCloudHost dan dapatkan URL
		await createImage(file, req.body, folderPath);
		ApiResponse.sendSuccess(res, "Image uploaded successfully", StatusCodes.CREATED);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

export async function createMultipleImagesController(req: Request, res: Response) {
	try {
		const files = req.files as Express.Multer.File[];
		const { entityId, imageType, entityType } = req.body;

		if (!files || !entityId || !entityType || !imageType) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Upload files is not valid!");
		}

		// Folder path sesuai dengan entity type
		const folderPath = `${entityType.toLowerCase()}/${imageType.toLowerCase()}`;

		// Proses setiap file dan simpan record-nya
		await Promise.all(files.map((file) => createImage(file, req.body, folderPath)));

		ApiResponse.sendSuccess(res, "All images uploaded successfully", StatusCodes.CREATED);
	} catch (error) {
		return ApiResponse.sendError(res, error as Error);
	}
}

export async function deleteImageController(req: Request, res: Response) {
	try {
		const { id } = req.params;

		// Cari gambar di database
		const image = await prisma.image.findUnique({
			where: { id: parseInt(id) },
		});

		if (!image) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Image not found");
		}

		// Hapus dari S3
		await deleteS3(image.source);

		// Hapus dari database
		await prisma.image.delete({
			where: { id: parseInt(id) },
		});

		ApiResponse.sendSuccess(res, "Image deleted successfully");
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

// controllers/image.controller.ts
export async function updateImageController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const file = req.file;
		const { entityId, imageType, entityType } = req.body;

		if (!file || !entityId || !entityType || !imageType) {
			throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
		}

		// Cari gambar yang akan diupdate
		const existingImage = await prisma.image.findUnique({
			where: { id: parseInt(id) },
		});

		if (!existingImage) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Image not found");
		}

		// Hapus gambar lama dari S3
		await deleteS3(existingImage.source);

		// Upload gambar baru
		const folderPath = `${entityType.toLowerCase()}/${imageType.toLowerCase()}`;
		const source = await uploadS3(file, folderPath);

		// Update database
		const updatedImage = await prisma.image.update({
			where: { id: parseInt(id) },
			data: {
				source,
				filename: `${Date.now()}-${file.originalname}`,
				size: file.size,
				mimetype: file.mimetype,
			},
		});

		ApiResponse.sendSuccess(res, updatedImage, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function createImage(file: Express.Multer.File, metaData: IImage, folderPath: string) {
	// Upload file ke idCloudHost
	const source = await uploadS3(file, folderPath);

	// Buat nama file unik
	const newFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

	// Simpan metadata ke database
	await prisma.image.create({
		data: {
			imageType: metaData.imageType,
			alt: metaData.alt || file.originalname,
			filename: newFilename,
			source: source,
			mimetype: file.mimetype,
			size: file.size,
			entityId: metaData.entityId,
			entityType: metaData.entityType,
		},
	});

	return source;
}
