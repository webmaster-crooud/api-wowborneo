import { TYPECABIN } from "@prisma/client";
import { IImage } from "./image";
import { Decimal } from "@prisma/client/runtime/library";

export interface ICabinRequestBody {
	name: string;
	type: TYPECABIN;
	maxCapacity: number;
	description: string | null;
	price: string;
	duration: number;
}
export interface ICabinResponse {
	id: string | number;
	name: string;
	type: TYPECABIN;
	maxCapacity: number;
	description: string | null;
	price: string | Decimal;
	duration: number;
	cover: IImage | null;
}
