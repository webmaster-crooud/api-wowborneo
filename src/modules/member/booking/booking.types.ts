import { BOOKING_STATUS, GUEST_TYPE, PAYMENT_STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { IRefundBookingResponse } from "../refund/refund.types";
export interface IMemberBookingListResponse {
	id: string;
	bookingStatus: BOOKING_STATUS;
	paymentStatus: PAYMENT_STATUS;
	paymentType: "Full Payment" | "Down Payment" | string;
	cruiseTitle: string; // title cruise
	boatName: string; // title boat
	cabinName: string;
	finalPrice: string | number | Decimal;
	adults: number;
	children: number;
	schedule: {
		departureAt: string | Date;
		arrivalAt: string | Date;
		departure: string;
	};
	createdAt: Date | string;
}

export interface IMemberBookingDetailResponse {
	id: string;
	email: string;
	bookingStatus: BOOKING_STATUS;
	paymentStatus: PAYMENT_STATUS;
	paymentType: "Full Payment" | "Down Payment" | string | null;
	cruiseTitle: string; // title cruise
	boatName: string; // title boat
	cabinName: string;
	amountPayment: string | number | Decimal;
	amountPaymentIDR: string | number | Decimal;
	balancePayment: string | number | Decimal;
	balancePaymentIDR: string | number | Decimal;
	subTotalPrice: string | number | Decimal;
	discount: string | number | Decimal;
	finalPrice: string | number | Decimal;
	createdAt: Date | string;
	updatedAt: Date | string;
	paidAt: Date | string | null;
	confirmedAt: Date | string | null;
	addons: Array<{
		title: string;
		qty: number;
		price: string | number | Decimal;
		totalPrice: string | number | Decimal;
	}>;
	guests: Array<{
		firstName: string;
		lastName: string | null;
		children: GUEST_TYPE;
		email: string;
		phone: string;
		identityNumber: string;
		country: string;
		document: string | null;
		price: string | number | Decimal;
	}>;
	transactions: Array<{
		id: string;
		email: string;
		amount: string | number | Decimal;
		amountIDR: string | number | Decimal;
		status: PAYMENT_STATUS;
		notes: string | null;
		createdAt: string | Date;
		updatedAt: string | Date;
	}>;

	refund?: IRefundBookingResponse | null;
}

export interface IUpcomingBookingResponse {
	id: string;
	cruiseTitle: string;
	finalPrice: string | number | Decimal;
	bookingStatus: BOOKING_STATUS;
	paymentStatus: PAYMENT_STATUS;
	schedule: {
		departureAt: string | Date;
		arrivalAt: string | Date;
		departure: string;
	};
}
