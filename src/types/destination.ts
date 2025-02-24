import { STATUS } from "./main";

export interface DestinationInterface {
	id?: number;
	cruiseId: string;
	title: string;
	description: string | null;
	days: string | null;
	imageCover: string | null;
	alt: string | null;
	status: STATUS;
	createdAt: Date | string;
	updatedAt: Date | string;
}
