export interface RegisterInterface {
	firstName: string;
	lastName?: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
}

export interface ChangePasswordInterface {
	email: string;
	token: string;
	password: string;
	confirmPassword: string;
}

export interface RoleInterface {
	id: string;
	name: string;
	description?: string;
	status: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface LoginInterface {
	email: string;
	password: string;
}

// export interface AuthenticationInterface {
//     user: UserInterface;
//     account: AccountInterface;
//     emailVerify: EmailVerifyInterface;
// }

// interface UserInterface {
//     id?: string;
//     firstName: string;
//     lastName?: string;
//     email: string;
//     phone: string;
//     status: string;
//     createdAt: Date | string;
//     updatedAt: Date | string;
// }

// interface AccountInterface {
//     id: string;
//     email: string;
//     userId: string;
//     password?: string;
//     ip: string;
//     userAgent: string;
//     googleId?: string;
//     status: string;
//     roleId: number;
//     createdAt: Date | string;
//     updatedAt: Date | string;
// }

// interface EmailVerifyInterface {
//     id: number;
//     accountId: string;
//     token: string;
//     type: string;
//     createdAt: Date | string;
//     updatedAt: Date | string;
//     expiredAt: Date | string;
// }
