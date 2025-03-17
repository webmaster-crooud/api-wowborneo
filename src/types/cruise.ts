import { IDestination } from "./destination";
import { ICover } from "./image";
import { STATUS } from "./main";

export interface ICruises {
	id: string;
	title: string;
	status: STATUS;
	departure: string | null;
	duration: string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}
export interface ICruise {
	id?: string;
	slug: string;
	title: string;
	subTitle: string | null;
	description: string | null;
	departure: string | null;
	duration: string;
	status: STATUS;
	introductionTitle: string | null;
	introductionText: string | null;
	cta: string | null;
	destinations: IDestination[];
	highlights: IHighlight[];
	include: IInclude[];
	informations: IInformation[];
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface IHighlight {
	id?: number;
	title: string;
	description: string | null;
	cover: ICover | null;
}

export interface IInclude {
	id?: number;
	title: string;
	description: string | null;
}

export interface IInformation {
	id?: number;
	title: string;
	text: string | null;
}
