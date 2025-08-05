export interface IBoat {
	name: string;
	slug: string;
	description: string;
	cover: string;
	abouts: IAboutBoat[];
	experiences: IExperience[];
	facilities: IFacility[];
	deck: {
		image: string;
		title: string;
		description: string;
	};
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
