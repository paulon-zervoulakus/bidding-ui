import React, { useState } from "react";
import { register } from "../../../hooks/account";
import { useNavigate } from "react-router-dom";

const RegisterIndex: React.FC = () => {
	var navigate = useNavigate();
	// Define state for form fields and errors
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [errors, setErrors] = useState<string[]>([]);

	// Handle form submission
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		// Clear previous errors
		setErrors([]);

		// Basic validation
		const newErrors: string[] = [];
		if (!email) newErrors.push("Email is required.");
		if (!password) newErrors.push("Password is required.");
		if (password !== confirmPassword)
			newErrors.push("Passwords do not match.");
		if (!dateOfBirth) newErrors.push("Date of birth is required.");

		// If there are errors, set them and return
		if (newErrors.length > 0) {
			setErrors(newErrors);
			return;
		}

		register(email, password, confirmPassword, dateOfBirth, () => {
			navigate("/login");
		});
	};

	return (
		<main className="flex-grow-1 p-4">
			<div className="container w-50">
				<h1>Register Here</h1>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="email" className="form-label">
							Email
						</label>
						<input
							type="email"
							id="email"
							className="form-control"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="password" className="form-label">
							Password
						</label>
						<input
							type="password"
							id="password"
							className="form-control"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="confirmPassword" className="form-label">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							className="form-control"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="dateOfBirth" className="form-label">
							Date of Birth
						</label>
						<input
							type="date"
							id="dateOfBirth"
							className="form-control"
							value={dateOfBirth}
							onChange={(e) => setDateOfBirth(e.target.value)}
							required
						/>
					</div>

					{errors.length > 0 && (
						<div className="alert alert-danger">
							<ul>
								{errors.map((error, index) => (
									<li key={index}>{error}</li>
								))}
							</ul>
						</div>
					)}

					<button type="submit" className="btn btn-primary">
						Register
					</button>
				</form>
			</div>
		</main>
	);
};

export default RegisterIndex;
