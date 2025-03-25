export interface IAboatRequestBody {
	title: string;
	description: string | null;
}
export interface IAboutResponse {
	id: string | number;
	title: string;
	description: string | null;
}
export interface IUpdateAboutRequest {
	title: string;
	description: string | null;
}
