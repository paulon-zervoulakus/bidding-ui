import React, { useState } from "react";
import { register } from "../../../hooks/account";
import { useNavigate } from "react-router-dom";

const RegisterIndex: React.FC = () => {
	const navigate = useNavigate();
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
		<main className="flex justify-center">
			<div className="form-registration">
				<div className="form-outter">
					<h3 className="title">Registration</h3>
					<form onSubmit={handleSubmit}>
						<div className="field-entry">
							<label htmlFor="email" >
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
							<label htmlFor="password" >
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

						<div className="field-entry">
							<label htmlFor="confirmPassword">
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>

						<div className="field-entry">
							<label htmlFor="dateOfBirth" >
								Date of Birth
							</label>
							<input
								type="date"
								id="dateOfBirth"
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
						<div className="form-controls">
							<button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition">
								Register
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
};

export default RegisterIndex;
