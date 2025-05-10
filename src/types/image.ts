export interface IImage {
	id?: number;
	imageType: "COVER" | "PHOTO";
	alt: string | null;
	entityId: string;
	entityType: string;
	source: string;
}

export interface ICover {
	id?: number;
	imageType: "COVER" | "PHOTO";
	alt: string | null;
	entityId: string;
	entityType: string;
	source: string;
}
