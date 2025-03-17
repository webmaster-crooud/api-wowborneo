import { ICover } from "./image";
import { STATUS } from "./main";

export interface IDestination {
	id?: number;
	cruise?: {
		title: string;
		id: string;
	};
	title: string;
	description: string | null;
	days: string | null;
	status: STATUS;
	cover: ICover | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}
