import { TYPECABIN } from "@prisma/client";
import { IImage } from "./image";
import { Decimal } from "@prisma/client/runtime/library";

export interface ICabinRequestBody {
	name: string;
	type: TYPECABIN;
	maxCapacity: number;
	description: string | null;
	price: string;
}
export interface ICabinResponse {
	id: string | number;
	name: string;
	type: TYPECABIN;
	maxCapacity: number;
	description: string | null;
	price: string | Decimal;
	cover: IImage | null;
}
