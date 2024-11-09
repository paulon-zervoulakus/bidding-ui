import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/userContextProvider";
import { login } from "../../../hooks/account";
import { AxiosError } from "axios";

const LoginForm: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const context = useContext(UserContext);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);

		if (!context) {
			// Handle the case where context is undefined
			console.error("UserContext is not available");
			setError("User context is not available. Please try again later.");
			return;
		}

		try {
			await login(email, password, context.setUser, () => {
				 navigate("/");
			});
		} catch (err: unknown) {
			// Type guard to check if `err` is an Error object
			if (err instanceof Error && (err as AxiosError).response) {
				const response = (err as AxiosError).response; // Casting to any for this access
				if (response?.status === 401) {
					setError(
						"Invalid credentials. Please check your email and password."
					);
				} else if (response?.status === 400) {
					 // Ensure that response.data is a string or null
					const errorMessage = typeof response.data === 'string'
					? response.data
					: null;

					setError(errorMessage);
				} else {
					setError("An error occurred. Please try again.");
				}
			} else {
				// Handle case where `err` is not an expected type
				setError("An unexpected error occurred.");
			}
		}
	};

	return (
		<main className="flex justify-center">
			<div className="form-login">
				<div className="form-outter">
					<h3 className="title">Login</h3>
					<form onSubmit={handleSubmit}>
						<div className="field-entry">
							<label htmlFor="email">
								Email
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="field-entry">
							<label htmlFor="password">
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{error && (
							<div className="mb-4 text-red-600">
								{error}
							</div>
						)}
						<div className="form-controls">
							<button type="submit">
								Login
							</button>
							<Link to="/register">
								Registration
							</Link>
						</div>
					</form>
				</div>
			</div>
		</main>


	);
};

export default LoginForm;
