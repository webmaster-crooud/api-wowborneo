import { DISCOUNT_TYPE, STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface IPromotionRequest {
	name: string;
	code: string;
	discountType: DISCOUNT_TYPE;
	discountValue: string | Decimal;
	startDate: string | Date;
	endDate: string | Date;
}

export interface IPromotionResponse {
	id: string | number;
	name: string;
	code: string;
	discountType: DISCOUNT_TYPE;
	discountValue: string | Decimal;
	startDate: string | Date;
	endDate: string | Date;
	status: STATUS;
	createdAt: string | Date;
	updatedAt: string | Date;
}
