import { useEffect, useState } from "react";
import { GetProfileDetails, UpdateProfileDefails } from "../../../hooks/account";
import { BasicProfileDTO } from "../../../dto/account";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setUser } from "../../../store/user/userSlice";

const ProfileForm: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();

	const { profile } = useSelector((state: RootState) => state.user);
	const [account, setAccount] = useState<BasicProfileDTO>({
		id: 0,
		userName: "",
		email: "",
		fullName: "",
		dateOfBirth: "",
		role: 1,
		gender: 2,
	} as BasicProfileDTO);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAccount((prev) => ({
			...prev,
			[name]: ["id", "role", "gender"].includes(name) ? Number(value) : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);
		try {
			await UpdateProfileDefails(account, (data) => {
				dispatch(setUser(data));
				setAccount(data);
			});
			setMessage({ type: "success", text: "Profile updated successfully" });
		} catch (err) {
			console.error("Failed to update profile", err);
			setMessage({ type: "error", text: "Failed to update profile. Please try again." });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		GetProfileDetails((data) => {
			setAccount({
				...data,
				role: Number(data.role),
				gender: Number(data.gender),
				dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
			});
		});
	}, []);

	const roleOptions = [
		{ value: 1, label: "Guest" },
		{ value: 2, label: "Member" },
		{ value: 4, label: "Administrator" },
		{ value: 8, label: "Seller" },
	];

	const genderOptions = [
		{ value: 1, label: "Hidden" },
		{ value: 2, label: "Male" },
		{ value: 3, label: "Female" },
	];

	return (
		<div className="mx-auto w-full max-w-2xl">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
				<div className="mb-6">
					<h2 className="text-2xl font-semibold text-gray-900">Profile Settings</h2>
					<p className="text-gray-500 mt-1">Manage your account information and preferences</p>
				</div>

				{message && (
					<div
						className={`mb-6 p-4 rounded-lg text-sm ${
							message.type === "success"
								? "bg-green-50 text-green-800 border border-green-200"
								: "bg-red-50 text-red-800 border border-red-200"
						}`}
						role="alert"
					>
						{message.text}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6" noValidate>
					<fieldset className="space-y-4">
						<legend className="text-lg font-medium text-gray-900 mb-4">Personal Information</legend>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
									Username <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="userName"
									name="userName"
									value={account.userName}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									required
									disabled={isLoading}
								/>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={account.email}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
								Full Name
							</label>
							<input
								type="text"
								id="fullName"
								name="fullName"
								value={account.fullName}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
								Date of Birth
							</label>
							<input
								type="date"
								id="dateOfBirth"
								name="dateOfBirth"
								value={account.dateOfBirth}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								disabled={isLoading}
							/>
						</div>
					</fieldset>

					<fieldset className="space-y-4 border-t border-gray-200 pt-6">
						<legend className="text-lg font-medium text-gray-900 mb-4">Account Settings</legend>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
									Role
								</label>
								<select
									id="role"
									name="role"
									value={account.role}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
									disabled={isLoading}
								>
									{roleOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
									Gender
								</label>
								<select
									id="gender"
									name="gender"
									value={account.gender}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
									disabled={isLoading}
								>
									{genderOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</fieldset>

					<div className="flex justify-end pt-4 border-t border-gray-200">
						<button
							type="submit"
							disabled={isLoading}
							className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfileForm;