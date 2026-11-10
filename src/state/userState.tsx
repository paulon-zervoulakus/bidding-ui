export interface User {
	id: number;
	userName: string;
	fullName: string;
	email: string;
	isActive: boolean;
	isLoggedIn: boolean;
	role: number;
}

export interface SessionResponse {
	id: number;
	userName: string;
	fullName: string;
	email: string;
	role: number;
	gender: number;
	isActive: boolean;
	isLoggedIn: boolean;
	lastLoggedIn: string;
}
