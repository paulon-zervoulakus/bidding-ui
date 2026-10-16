import React, { useState } from "react";
import { register } from "../../../hooks/account";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const RegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	confirmPassword: z.string().min(6),
	dateOfBirth: z.string(),
});

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

			// Validate form data using Zod
		const result = RegisterSchema.safeParse({
			email,
			password,
			confirmPassword,
			dateOfBirth,
		});

		if (!result.success) {
			// If validation fails, set errors
			const newErrors = result.error.errors.map((err) => err.message);
			setErrors(newErrors);
			return;
		}

		// If validation passes, proceed with registration
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
