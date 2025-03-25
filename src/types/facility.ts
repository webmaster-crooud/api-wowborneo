export interface IFacilityRequestBody {
	name: string;
	description: string | null;
	icon: string | null;
}
export interface IFacilityResponse {
	id: string | number;
	name: string;
	description: string | null;
	icon: string | null;
}
