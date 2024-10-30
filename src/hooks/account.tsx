import axios from "./initAxios";
import { SessionResponse, User } from "../state/userState";
import { StopConnection as SignalRStopConnection } from "./signalRService";
import { BasicProfileDTO } from "../dto/account";

export const pingSessionStatus = async (): Promise<
	SessionResponse | undefined
> => {
	try {
		const res = await axios.get(`/api/Account/validate-token/`, {
			withCredentials: true,
		});

		if (
			res.data &&
			typeof res.data === "object" &&
			"status" in res.data &&
			res.data.status == "token validated"
		) {
			if ("accountProfile" in res.data) {
				return {
					userName: res.data.accountProfile.userName,
					fullName: res.data.accountProfile.fullName,
					email: res.data.accountProfile.email,
					role: res.data.accountProfile.role,
					gender: res.data.accountProfile.gender,
					lastLoggedIn: res.data.accountProfile.lastLoggedIn,
					isActive: true,
					isLoggedIn: true,
				};
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	} catch  {
		return undefined;
	}
};

export const getAuthToken = async (
	setUser: React.Dispatch<React.SetStateAction<User>>
) => {
	axios.get("/api/Account/get-user-token/").then((res) => {
		if ("passed" in res.data) {
			console.log(res.data);
			setUser({
				userName: res.data.userName,
				fullName: res.data.fullName,
				email: res.data.email,
				isActive: true,
				isLoggedIn: true,
			});
		}
	});
};

export const logout = (
	setUser: React.Dispatch<React.SetStateAction<User>>
) => {
	axios
		.get("/api/Account/logout/", {
			headers: { "Content-Type": "application/json" },
			withCredentials: true,
		})
		.then((res) => {
			if (res.status == 200) {
				setUser({
					userName: "",
					fullName: "",
					email: "",
					isActive: false,
					isLoggedIn: false,
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
	const response = await axios.post(
		"/api/Account/login/", // Endpoint URL
		{ Email: email, Password: password }, // Request body
		{
			// Configuration object
			headers: { "Content-Type": "application/json" },
			withCredentials: true,
		}
	);

	if (response.data && response.status == 200) {

		setUser({
			userName: response.data.userName,
			fullName: response.data.fullName,
			email: response.data.email,
			isActive: true,
			isLoggedIn: true, // Updated to reflect logout
		});
		if (onSuccessLogin) {
			onSuccessLogin();
		}
	}
};

export const register = async (
	email: string,
	password: string,
	confirmPassword: string,
	dateOfBirth: string,
	onSuccessRegistration?: () => void
) => {
	const response = await axios.post(
		"/api/Account/register/", // Endpoint URL
		{
			Email: email,
			Password: password,
			ConfirmPassword: confirmPassword,
			DateOfBirth: dateOfBirth,
		}, // Request body
		{ headers: { "Content-Type": "application/json" } }
	);

	if (response.data && response.status == 200 && onSuccessRegistration) {
		onSuccessRegistration();
	}
};

export const GetProfileDetails = async (
	onGetProfileDetails?: (data: BasicProfileDTO) => void
) => {
	const response = await axios.get(
		"/api/Account/get-profile-basic",
		{ headers: { "Content-Type":"application/json"}, withCredentials: true}
	);
	if(response.data && response.status == 200 && onGetProfileDetails){
		const res = response.data;

		const data: BasicProfileDTO = {
			userName: res.userName,
			fullName: res.fullName,
			id: res.id,
			email: res.email,
			dateOfBirth: res.dateOfBirth,
			role: res.role,
			gender: res.gender
		};
		onGetProfileDetails(data);
	}
}