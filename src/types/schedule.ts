import { STATUS, TYPECABIN } from "@prisma/client";
import { ICruise } from "./cruise";
import { IImage } from "./image";
import { ICabinResponse } from "./cabin";
import { IAddonResponse } from "../modules/admin/addon/addon.type";

export interface IScheduleRequestBody {
	cruiseId: string;
	boatId: string;
	departureAt: Date | string;
	status: STATUS;
	addons: Array<{ addonId: number }>;
}

export interface IListScheduleResponse {
	id: string;
	departureAt: string | Date;
	arrivalAt: string | Date;
	cruiseTitle: string;
	boatTitle: string;
	departure: string;
	status: STATUS; // Bisa diganti dengan enum jika sudah ada
	min_price: number;
	availableCabin: number;
	bookedCabin: number;
	cover: string | null; // Path cover image
}

export interface IDetailScheduleResponse {
	id: string;
	departureAt: string | Date;
	arrivalAt: string | Date;
	status: STATUS;
	cruise: {
		id: string;
		title: string;
		cover: string | null;
		departure: string;
		description: string;
	};
	boat: {
		name: string;
		id: string;
		deck: {
			cover: string | null;
		};
		cabins: Array<{ id: string | number; name: string; type: TYPECABIN; maxCapacity: number; description: string | null; price: string }>;
	};
	bookingCabins: Array<{
		cabinId: string | number;
	}>;
	addons: IAddonResponse[];
}
