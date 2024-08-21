export interface User {
	userName: string;
	email: string;
	isActive: boolean;
	isLoggedIn: boolean;
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
