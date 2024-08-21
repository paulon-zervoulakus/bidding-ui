import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/userContextProvider";
import { login } from "../../../hooks/account";

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
		} catch (err: any) {
			// Handle specific errors based on the response or error object
			if (err.response && err.response.status === 401) {
				setError(
					"Invalid credentials. Please check your email and password."
				);
			} else {
				if (err.response.status == 400) {
					setError(err.response.data);
				} else {
					setError("An error occurred. Please try again.");
				}
			}
		}
	};

	return (
		<main className="flex-grow-1">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-md-6">
						<div className="card mt-5">
							<div className="card-body">
								<h3 className="card-title text-center mb-4">
									Login
								</h3>
								<form onSubmit={handleSubmit}>
									<div className="mb-3">
										<label
											htmlFor="email"
											className="form-label"
										>
											Email
										</label>
										<input
											type="email"
											id="email"
											className="form-control"
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
											required
										/>
									</div>

									<div className="mb-3">
										<label
											htmlFor="password"
											className="form-label"
										>
											Password
										</label>
										<input
											type="password"
											id="password"
											className="form-control"
											value={password}
											onChange={(e) =>
												setPassword(e.target.value)
											}
											required
										/>
									</div>

									{error && (
										<div className="alert alert-danger">
											{error}
										</div>
									)}

									<button
										type="submit"
										className="btn btn-primary w-50"
									>
										Login
									</button>
									<Link to="/register" className="btn w-50">
										Registration
									</Link>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default LoginForm;
