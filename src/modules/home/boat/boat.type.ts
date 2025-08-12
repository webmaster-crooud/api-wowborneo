export type TYPECABIN = "DOUBLE" | "SUPER" | "TWIN";

export interface IBoat {
	name: string;
	slug: string;
	description: string;
	abouts: IAboutBoat[];
	experiences: IExperience[];
	facilities: IFacility[];
	deck: {
		image: string;
		title: string;
		description: string;
	};
	cover: string;
	coverAlt?: string;
}

export interface IBoatListPage {
	name: string;
	slug: string;
	description: string;
	cover: string;
	facilities: IFacility[];
}

export interface IBoatMinimal {
	name: string;
	slug: string;
	description: string;
	cover: string;
}

export interface IBoatDetail {
	name: string;
	slug: string;
	option: string;
	description: string;
	cover: string | null;
	coverAlt?: string | null;
	abouts: IAboutBoat[];
	facilities: IFacility[];
	cabins: {
		type: TYPECABIN;
		cover: string;
		description: string;
		price: string;
	}[];
	experiences: IExperience[];
	deck: {
		image: string | null;
		title: string;
		description: string;
	};
	cruise: string;
}

export interface IAboutBoat {
	id: number | string;
	title: string;
	description: string;
}

export interface IExperience {
	id: number | string;
	cover?: string;
	title: string;
	description: string;
}

export interface ICabin {
	type: "Double" | "Super" | "TWIN";
	cover: string;
	description: string;
	price: string;
	facilities: ICabinFacility[];
	images: {
		source: string;
		alt: string;
	};
}

export interface ICabinFacility {
	name: string;
	icon: string;
}

export interface IFacility {
	name: string;
	icon: string;
	description: string;
}

export interface ICruiseBoat {
	title: string;
	days: number;
	night: number;
	price: string;
	cover: string;
}
export interface IImage {
	id?: number;
	imageType: "COVER" | "PHOTO";
	alt: string | null;
	entityId: string;
	entityType: string;
	source: string;
}
