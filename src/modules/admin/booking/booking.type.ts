import { BOOKING_STATUS, PAYMENT_STATUS, TYPECABIN } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface IAdminBookingListResponse {
	id: string;
	email: string;
	bookingStatus: BOOKING_STATUS;
	paymentStatus: PAYMENT_STATUS;
	paymentType: "Full Payment" | "Down Payment" | string;
	finalPrice: string | number | Decimal;
	adults: number;
	children: number;
	schedule: {
		departureAt: string | Date;
		arrivalAt: string | Date;
	};
	cruise: {
		id: string;
		title: string;
		departure: string;
	};
	boat: {
		id: string;
		name: string;
	};
	cabin: {
		name: string;
		type: TYPECABIN;
	};
}
