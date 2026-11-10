import { SessionResponse, User } from "../state/userState";
import { StopConnection as SignalRStopConnection } from "./signalRService";
import { BasicProfileDTO } from "../dto/account";

export const pingSessionStatus = async (): Promise<
	SessionResponse | undefined
> => {
	try {
		const res = await fetch(`${__API_URL__}/api/Account/validate-token/`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return undefined;

		const data = await res.json();

		if (
			data &&
			typeof data === "object" &&
			"status" in data &&
			data.status == "token validated"
		) {
			if ("accountProfile" in data) {
				return {
					id: data.accountProfile.id,
					userName: data.accountProfile.userName,
					fullName: data.accountProfile.fullName,
					email: data.accountProfile.email,
					role: data.accountProfile.role,
					gender: data.accountProfile.gender,
					lastLoggedIn: data.accountProfile.lastLoggedIn,
					isActive: true,
					isLoggedIn: true,
				};
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	} catch {
		return undefined;
	}
};

export const getAuthToken = async (
	setUser: React.Dispatch<React.SetStateAction<User>>
) => {
	fetch(`${__API_URL__}/api/Account/get-user-token/`, {
		method: "GET",
		credentials: "include",
	})
		.then((res) => res.json())
		.then((res) => {
			if ("passed" in res) {
				console.log(res);
				setUser({
					id: res.id,
					userName: res.userName,
					fullName: res.fullName,
					email: res.email,
					isActive: true,
					isLoggedIn: true,
					role: res.role,
				});
			}
		});
};

export const logout = (
	setUser: React.Dispatch<React.SetStateAction<User>>
) => {
	fetch(`${__API_URL__}/api/Account/logout/`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	})
		.then((res) => {
			if (res.status == 200) {
				setUser({
					id: 0,
					userName: "",
					fullName: "",
					email: "",
					isActive: false,
					isLoggedIn: false,
					role: 0,
				});
				localStorage.removeItem("userProfile");
				localStorage.clear();

				SignalRStopConnection();
			}
		})
		.catch((err) => {
			console.log("logout error: ", err);
		});
};

export const login = async (
	email: string,
	password: string,
	setUser: React.Dispatch<React.SetStateAction<User>>,
	onSuccessLogin?: () => void
) => {
	const response = await fetch(`${__API_URL__}/api/Account/login/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ Email: email, Password: password }),
	});

	if (response.status == 200) {
		const data = await response.json();

		setUser({
			id: data.id,
			userName: data.userName,
			fullName: data.fullName,
			email: data.email,
			isActive: true,
			isLoggedIn: true, // Updated to reflect logout
			role: data.role,
		});
		if (onSuccessLogin) {
			onSuccessLogin();
		}
	} else {
		throw new Error(`Login failed: ${response.status}`);
	}
};

export const register = async (
	email: string,
	password: string,
	confirmPassword: string,
	dateOfBirth: string,
	onSuccessRegistration?: () => void
) => {
	const response = await fetch(`${__API_URL__}/api/Account/register/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			Email: email,
			Password: password,
			ConfirmPassword: confirmPassword,
			DateOfBirth: dateOfBirth,
		}),
	});

	if (response.status == 200 && onSuccessRegistration) {
		onSuccessRegistration();
	}
};

export const GetProfileDetails = async (
	onGetProfileDetails?: (data: BasicProfileDTO) => void
) => {
	const response = await fetch(`${__API_URL__}/api/Account/get-profile-basic`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	if (response.status == 200 && onGetProfileDetails) {
		const res = await response.json();

		const data: BasicProfileDTO = {
			userName: res.userName,
			fullName: res.fullName,
			id: res.id,
			email: res.email,
			dateOfBirth: res.dateOfBirth,
			role: res.role,
			gender: res.gender,
		};
		onGetProfileDetails(data);
	}
};

export const UpdateProfileDefails = async (
	profile: BasicProfileDTO,
	onGetProfileDetails?: (data: BasicProfileDTO) => void
): Promise<BasicProfileDTO> => {
	const response = await fetch(
		`${__API_URL__}/api/Account/update-profile-basic`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(profile),
		}
	);

	if (!response.ok) {
		throw new Error(`Profile update failed: ${response.statusText}`);
	}

	const updatedProfile: BasicProfileDTO = await response.json();

	onGetProfileDetails?.(updatedProfile);

	return updatedProfile;
};
