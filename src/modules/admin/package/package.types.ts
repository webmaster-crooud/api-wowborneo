import { STATUS } from "@prisma/client";

export interface IPackageResponse {
	id: string;
	title: string;
	description: string;
	cruises: Array<{
		title: string;
		id?: string;
	}>;
	date: string | Date;
	status: STATUS;
}

export interface IPackageRequest {
	title: string;
	description: string;
	cruises: Array<{
		cruiseId: string;
	}>;
}
