export interface User {
	userName: string;
	fullName: string;
	email: string;
	isActive: boolean;
	isLoggedIn: boolean;
	role: number;
}

export interface SessionResponse {
	userName: string;
	fullName: string;
	email: string;
	role: number;
	gender: number;
	isActive: boolean;
	isLoggedIn: boolean;
	lastLoggedIn: string;
}
