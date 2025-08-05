import { STATUS } from "@prisma/client";
import { IHighlight, IInclude, IInformation } from "../../../types/cruise";
import { IDestination } from "../../../types/destination";

export interface PackageCruiseResponse {
	title: string;
	description?: string;
	cruise: Array<{
		title: string;
		slug: string;
		price: string;
		cover: string;
	}>;
}

export interface CruiseResponse {
	title?: string;
	slug?: string;
	subHeading?: string;
	duration?: string;
	price?: string;
	description?: string;
	destination?: Array<{
		id: number;
		title?: string;
		days?: string;
		cover?: string;
		description?: string;
	}>;
	destinationText?: string;
	cover: string;
	departure?: string;
	introduction?: {
		title?: string;
		text?: string;
	};
	highlight?: Array<{
		id: number;
		title?: string | null;
		description?: string;
		cover?: string;
	}>;
	included?: IInclude[];
	information?: IInformation[];
	cta?: string;
}
