export interface IAccount {
	id?: string;
	email: string;
	role?: string;
	firstName: string;
	lastName: string;
	phone: string;
	ip?: string;
	userAgent?: string;
	cover?: string;
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
