import { STATUS } from "@prisma/client";

export interface IAccount {
	id?: string;
	email: string;
	role?: string;
	roleId?: number;
	firstName: string;
	lastName: string;
	phone: string;
	ip?: string;
	userAgent?: string;
	cover?: string;
	status?: STATUS;
	updatedAt?: Date | string;
	createdAt?: Date | string;
}

export interface IUpdateAccount {
	firstName: string;
	lastName: string;
	phone: string;
}

export interface IChangePassword {
	oldPassword: string;
	password: string;
	confirmPassword: string;
}
