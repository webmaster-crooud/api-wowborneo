import { REFUND_STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface IAdminRefundBookingResponse {
	id: string;
	amount: string | Decimal;
	amountIDR: string | Decimal;
	percent: number;
	refundMethod: string;
	status: REFUND_STATUS;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface IAdminRefundDetailResponse {
	id: string;
	bookingId: string;
	amount: string | Decimal;
	amountIDR: string | Decimal;
	percent: number;
	refundMethod: string;
	status: REFUND_STATUS;
	price: string | Decimal;
	reason: string | null;
	bankName: string;
	bankNumber: string;
	bankOwner: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	processedAt: string | Date | null;
	processedBy: string | null;
}
