import { AGENT_TYPE } from "@prisma/client";

export interface IAgentRequest {
	accountId: string;
	type: AGENT_TYPE;
	commission: number;
	commissionLocal: number;
}

export interface IAgentResponse {
	id: string;
	accountId: string;
	name: string;
	type: AGENT_TYPE;
	commission: number;
	commissionLocal: number;
	createdAt: string | Date;
	updatedAt: string | Date;
}
