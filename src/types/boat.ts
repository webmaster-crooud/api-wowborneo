import { STATUS } from "@prisma/client";
import { IAboatRequestBody, IAboutResponse } from "./about";
import { ICabinRequestBody, ICabinResponse } from "./cabin";

import { IExperienceRequestBody, IExperienceResponse } from "./experience";
import { IFacilityRequestBody, IFacilityResponse } from "./facility";
import { IDeckRequestBody, IDeckResponse } from "./deck";
import { IImage } from "./image";

export interface IBoatRequestBody {
	name: string;
	slug: string | null;
	description: string | null;
	optionText: string | null;
	status: STATUS;
	abouts: IAboatRequestBody[];
	experiences: IExperienceRequestBody[];
	facilities: IFacilityRequestBody[];
	cabins: ICabinRequestBody[];
	deck: IDeckRequestBody;
}

export interface IDetailBoatResponse {
	id: string;
	name: string;
	slug: string | null;
	description: string | null;
	optionText: string | null;
	status: STATUS;
	cover: IImage | null;
	abouts: IAboutResponse[];
	experiences: IExperienceResponse[];
	facilities: IFacilityResponse[];
	cabins: ICabinResponse[];
	deck: IDeckResponse;
	createdAt: Date | string;
	updatedAt: Date | string;
	cruise: string;
}

export interface IListBoatResponse {
	id: string;
	name: string;
	slug: string | null;
	status: STATUS;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface IUpdateBoatRequest {
	name: string;
	description: string | null;
	optionText: string | null;
	cruiseId: string;
}
