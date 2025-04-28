import { REFUND_STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface ICalculateRefundAmountResponse {
	amount: string | Decimal;
	amountIDR: string | Decimal | number;
	percent: number;
	days: number;
}

export interface IRefundRequest {
	amount: string | Decimal;
	amountIDR: string | Decimal;
	percent: number;
	price: string | Decimal;
	reason: string;
	refundMethod: string;
	bankName: string;
	bankNumber: string;
	bankOwner: string;
}

export interface IRefundBookingResponse {
	id: string;
	amount: string | Decimal;
	amountIDR: string | Decimal;
	percent: number;
	refundMethod: string;
	status: REFUND_STATUS;
	createdAt: string | Date;
	updatedAt: string | Date;
}
