import { ReactNode, useState, createContext, useEffect } from "react";
import { SessionResponse, User } from "../state/userState";
import { pingSessionStatus } from "../hooks/account";

// Define the shape of the context value
interface UserContextType {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const UserContext = createContext<UserContextType | undefined>(
	undefined
);

const UserContextProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User>({
		userName: "",
		fullName: "",
		email: "",
		isActive: false,
		isLoggedIn: false,
	});
	useEffect(() => {
		const fetchData = async () => {
			const data: SessionResponse | undefined = await pingSessionStatus();
			localStorage.clear();
			if (data != undefined) {
				setUser({
					userName: data.userName,
					fullName: data.fullName,
					email: data.email,
					isActive: true,
					isLoggedIn: true,
				});

				localStorage.setItem("userProfile", JSON.stringify(data));
				// // Retrieve the JSON object
				// const storedUser = localStorage.getItem("userProfile");

				// // Parse the JSON string back into an object
				// const userObject = storedUser ? JSON.parse(storedUser) : null;
				// console.log(userObject);
			}
		};

		fetchData();
		// }
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
