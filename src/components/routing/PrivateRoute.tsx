import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { pingSessionStatus } from "../../hooks/account";
import { SessionResponse } from "../../state/userState";

const PrivateRoute: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const data: SessionResponse | undefined = await pingSessionStatus();
			if (data !== undefined) {
				localStorage.setItem("userProfile", JSON.stringify(data));
				setIsAuthenticated(true);
			} else {
				localStorage.clear();
				setIsAuthenticated(false);
			}
			setIsLoading(false);
		};

		fetchData();
	}, []);

	if (isLoading) {
		// Optionally return a loading spinner or any loading indicator here
		return <div>Loading...</div>;
	}

	return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
