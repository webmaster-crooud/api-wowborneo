import prisma from "../configs/database";

export async function getExchangeRate(): Promise<number> {
	const rate = await prisma.exchangeRate.findFirst({
		orderBy: { updatedAt: "desc" },
	});
	return rate?.rate || 15000; // Default jika belum ada data
}
