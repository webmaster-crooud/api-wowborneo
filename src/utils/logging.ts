import prisma from "../configs/database";

// Enum untuk mendefinisikan jenis operasi CRUD
export enum CrudAction {
	CREATE = "CREATE",
	READ = "READ",
	UPDATE = "UPDATE",
	DELETE = "DELETE",
}

// Kelas dasar yang menyediakan fungsi untuk membuat log
abstract class BaseLogger {
	protected async createLog(accountId: string, action: CrudAction, table: string, status: "SUCCESS" | "FAILED"): Promise<void> {
		await prisma.log.create({
			data: {
				accountId,
				action, // action akan diisi dengan nilai dari enum CrudAction
				table,
				status,
				createdAt: new Date(),
			},
		});
	}
}

// Kelas Logging yang mewarisi dari BaseLogger dan menyediakan metode CRUD khusus
class Logging extends BaseLogger {
	// Operasi CREATE
	async createSuccess(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.CREATE, table, "SUCCESS");
	}
	async createFailed(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.CREATE, table, "FAILED");
	}

	// Operasi READ
	async readSuccess(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.READ, table, "SUCCESS");
	}
	async readFailed(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.READ, table, "FAILED");
	}

	// Operasi UPDATE
	async updateSuccess(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.UPDATE, table, "SUCCESS");
	}
	async updateFailed(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.UPDATE, table, "FAILED");
	}

	// Operasi DELETE
	async deleteSuccess(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.DELETE, table, "SUCCESS");
	}
	async deleteFailed(accountId: string, table: string): Promise<void> {
		await this.createLog(accountId, CrudAction.DELETE, table, "FAILED");
	}
}

export const log = new Logging();
