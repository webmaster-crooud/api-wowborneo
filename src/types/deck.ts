import { IImage } from "./image";

export interface IDeckRequestBody {
	title: string;
	description: string | null;
}

export interface IDeckResponse {
	id: string | number;
	title: string;
	description: string | null;
	cover: IImage | null;
}
