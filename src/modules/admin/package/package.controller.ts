import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../../libs/apiResponse";
import { packageService } from "./package.service";
import { StatusCodes } from "http-status-codes";
import { IPackageRequest } from "./package.types";
import { log } from "../../../utils/logging";

async function listPackageController(req: Request, res: Response) {
	try {
		const data = await packageService.list();
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function cruiseListPackageController(req: Request, res: Response) {
	try {
		const data = await packageService.cruiseList();
		ApiResponse.sendSuccess(res, data, 200);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function createPackageController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const body: IPackageRequest = req.body;
		await packageService.create(body);
		await log.createSuccess(accountId, "Packages");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.createFailed(accountId, "Packages");
		ApiResponse.sendError(res, error as Error);
	}
}

async function detailPackageController(req: Request, res: Response) {
	try {
		const { id } = req.params;
		if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Package ID is required!");
		const data = await packageService.detail(String(id));
		ApiResponse.sendSuccess(res, data, StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}
async function deleteCruiseController(req: Request, res: Response) {
	try {
		const { packageId, cruiseId } = req.params;
		console.log(packageId, cruiseId);
		if (!packageId || !cruiseId) throw new ApiError(StatusCodes.BAD_REQUEST, "Identity is required!");
		await packageService.deleteCruise(packageId, cruiseId);
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		ApiResponse.sendError(res, error as Error);
	}
}

async function updatePackageController(req: Request, res: Response) {
	const { accountId } = req.user;
	try {
		const { packageId } = req.params;
		const body: IPackageRequest = req.body;
		await packageService.update(packageId, body);
		await log.updateSuccess(accountId, "Packages");
		ApiResponse.sendSuccess(res, "OK", StatusCodes.OK);
	} catch (error) {
		log.updateFailed(accountId, "Packages");
		ApiResponse.sendError(res, error as Error);
	}
}

export default { listPackageController, createPackageController, cruiseListPackageController, detailPackageController, deleteCruiseController, updatePackageController };
