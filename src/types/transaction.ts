import { STATUS, TYPECABIN } from "@prisma/client";
export interface ITransactionScheduleResponse {
	id: string;
	departureAt: string | Date;
	arrivalAt: string | Date;
	cruiseTitle: string;
	boatName: string;
	departure: string;
	status: STATUS; // Bisa diganti dengan enum jika sudah ada
	minPrice: number;
	cover: string | null; // Path cover image
	duration: number;
	maxCapcity: number;
}

export interface ITransactionDetailScheduleResponse {
	id: string;
	departureAt: string | Date;
	arrivalAt: string | Date;
	status: STATUS;
	totalBooking: number;
	cruise: {
		id: string;
		title: string;
		cover: string | null;
		galleries: Array<{ source: string }>;
		departure: string;
		description: string;
		duration: number;
	};
	boat: {
		name: string;
		id: string;
		deck: {
			cover: string | null;
		};
		facilities: Array<{
			name: string;
			icon: string;
			description: string;
		}>;
		cabins: Array<{
			id: string | number;
			name: string;
			type: TYPECABIN;
			maxCapacity: number;
			description: string | null;
			price: string;
			cover: string;
		}>;
	};
	min_price: number;
}

export interface IBookingItineraryResponse {
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
		duration: number;
	};
	boat: {
		name: string;
		cabin: {
			type: TYPECABIN;
			maxCapacity: number;
			price: string;
		};
	};
	addons: Array<{ id: number; title: string; description: string | null; cover: string | null; price: number | string }>;
}

export interface ITransactionRequest {
	email: string;
	cabinId: string;
	scheduleId: string;
	pax: number;
	addons: Array<IAddonRequest>;
	guests: Array<IGuestRequest>;
	guestPrice: string | number;
	addonPrice?: string | number;
	price: string | number;
	subTotal: string | number;
	finalTotal: string | number;
	discount: string | number;
	cruise: {
		title: string;
		id: string;
	};
	method: "dp" | "full" | null;
	amountPayment: string | number;
	amountUnderPayment: string | number;
}

export interface IRepaymentRequest {
	email: string;
	bookingId: string;
	amountPayment: string | number;
}

export interface IGuestRequest {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	children: boolean;
	identityNumber: string;
	country: string;
	document: string;
	signature: boolean;
	price: string | number;
}

export interface IAddonRequest {
	id: number;
	qty: number;
	price: string;
	totalPrice: string;
	title: string;
	description: string;
}
