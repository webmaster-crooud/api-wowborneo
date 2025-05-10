import { IAddonRequest, IGuestRequest } from "../../types/transaction";

export interface ISetCartRequest {
	cabinId: number;
	scheduleId: string;
	pax: number;
}

export interface ICartResponse {
	email: string;
	cabinId: string;
	scheduleId: string;
	pax: number;
	addons: Array<IAddonRequest>;
	guests: Array<IGuestRequest>;
	guestPrice?: string | number;
	addonPrice?: string | number;
	price: string | number;
	subTotal?: string | number;
	finalTotal?: string | number;
	discount?: string | number;
	cruise: {
		title: string;
		id: string;
	};
	method?: "dp" | "full";
	amountPayment?: string | number;
	amountUnderPayment?: string | number;
}

export interface ICartAddonRequest {
	id: number;
	qty: number;
}

export interface ICartGuestRequest {
	email: string;
	identityNumber: string;
	firstName: string;
	lastName: string;
	phone: string;
	children: boolean;
	country: string;
	document: string;
	signature: boolean;
	price: string | number;
}
