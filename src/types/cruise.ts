import { DestinationInterface } from "./destination";
import { STATUS } from "./main";

export interface CruiseInterface {
	id?: string;
	slug: string;
	title: string;
	subTitle: string | null;
	description: string | null;
	departure: string | null;
	duration: string | null;
	status: STATUS;
	destinations: DestinationInterface[];
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface ImageCruiseInterface {
	id?: number;
	imageType: "COVER" | "PHOTO";
	alt?: string;
	description?: string;

	filename: string;
	source?: string;
	mimetype: string;
	size: number;

	cruiseId: string;
}
