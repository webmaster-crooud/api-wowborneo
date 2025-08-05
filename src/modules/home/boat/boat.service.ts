import prisma from "../../../configs/database";
import { IBoat } from "./boat.type";

export class BoatService {
	static async list(): Promise<IBoat[]> {
		const result = await prisma.boat.findMany({
			where: {
				status: {
					notIn: ["BLOCKED", "PENDING", "DELETED"],
				},
			},
			include: {
				abouts: true,
				facilities: true,
				deck: true,
				experiences: true,
			},
		});

		return result.map((boat) => ({
			name: boat.name,
			description: boat.description || "",
			slug: boat.slug,
			abouts: boat.abouts.flatMap((ab) => ({
				...ab,
				description: ab.description || "",
			})),
			deck: {
				title: boat.deck?.title || "",
				description: boat.deck?.description || "",
				image: "",
			},
			experiences: boat.experiences.flatMap((ex) => ({
				...ex,
				description: ex.description || "",
			})),
			facilities: boat.facilities.flatMap((f) => ({
				...f,
				description: f.description || "",
				icon: f.icon || "",
			})),
			cover: "",
		}));
	}
}
