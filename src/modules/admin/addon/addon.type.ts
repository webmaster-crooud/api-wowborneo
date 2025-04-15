import { STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface IAddonRequest {
	title: string;
	description: string | null;
	cover: string | null;
	price: string | number;
	status?: STATUS;
}

export interface IAddonResponse {
	id: number;
	title: string;
	description: string | null;
	cover: string | null;
	price: Decimal | number | string;
	status?: STATUS;
	createdAt: Date | string;
	updatedAt: Date | string;
}
