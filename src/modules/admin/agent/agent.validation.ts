import { string, z } from "zod";

export const agentValidation = z.object({
	body: z.object({
		accountId: z.string({ required_error: "Account is required!" }).max(100),
		type: z.string({ required_error: "Type Agent is required!" }),
		commission: z.number({ required_error: "Commission is Required!" }),
		commissionLocal: z.number({ required_error: "Commission Local (Indonesia) is Required!" }),
	}),
});
