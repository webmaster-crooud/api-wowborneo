import { IImage } from "./image";

export interface IExperienceRequestBody {
	title: string;
	description: string | null;
}
export interface IExperienceResponse {
	id: number | string;
	title: string;
	description: string | null;
	cover: IImage | null;
}
