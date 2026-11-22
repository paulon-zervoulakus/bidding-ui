import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContextProvider";
import { logout as hookLogout } from "../../hooks/account";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
		isActive
			? "bg-gray-800 text-white"
			: "text-gray-300 hover:bg-gray-800 hover:text-white"
	}`;
export enum RolesTypes {
    None = 0,
    Guest = 1,
    Member = 2,
    Administrator = 4,
    Seller = 8
}
export default function Navigation() {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const context = useContext(UserContext);
	const { setUser, user } = context || {};
	const getRole = (role: number): string => {
    return RolesTypes[role] ?? "Unknown";
	};
	const logout = () => {
		if (setUser) {
			localStorage.setItem("logout", Date.now().toString()); // Notify other tabs
			hookLogout(setUser);
			navigate("/login");
		} else {
			console.log("Unable to logout");
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const q = query.trim();
		if (!q) return;
		navigate(`/search?q=${encodeURIComponent(q)}`); // change to your real search route
	};

	// Close the mobile menu after navigating
	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	// Log out here when another tab logs out
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === "logout") {
				window.location.href = "/login";
			}
		};
		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	return (
		<header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-wrap items-center justify-between md:flex-nowrap md:gap-6">
					{/* Brand + mobile toggle */}
					<div className="flex w-full items-center justify-between py-3 md:w-auto">
						<Link to="/" className="text-lg font-bold text-white whitespace-nowrap">
							Subasta ng Bayan
						</Link>

						<button
							type="button"
							onClick={() => setIsOpen((open) => !open)}
							className="md:hidden rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							aria-controls="primary-navigation"
							aria-expanded={isOpen}
							aria-label="Toggle navigation"
						>
							<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{isOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>

					{/* Links, search and account: stacked on mobile, one row on md+ */}
					<div
						id="primary-navigation"
						className={`${isOpen ? "flex" : "hidden"} w-full flex-col gap-4 pb-4 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-between md:gap-6 md:pb-0`}
					>
						<ul className="flex flex-col gap-1 md:flex-row md:items-center">
							<li>
								<NavLink to="/" end className={navLinkClass}>
									Home
								</NavLink>
							</li>
							<li>
								<NavLink to="/aboutus" className={navLinkClass}>
									About Us
								</NavLink>
							</li>
							{user?.isLoggedIn && (
								<li>
									<NavLink to="/account" className={navLinkClass}>
										Account
									</NavLink>
								</li>
							)}
							{user?.isLoggedIn && (
								<li>
									<span className="text-yellow-200 text-sm">{user?.fullName}({getRole(user?.role)})</span>
								</li>
							)}
						</ul>

						<div className="flex flex-col gap-3 md:flex-row md:items-center">
							<form onSubmit={handleSearch} role="search" className="flex items-center gap-2">
								<input
									type="search"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search"
									aria-label="Search"
									className="min-w-0 flex-1 md:w-48 lg:w-64 rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
								<button
									type="submit"
									className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
								>
									Search
								</button>
							</form>

							{user?.isLoggedIn ? (
								<button
									type="button"
									onClick={logout}
									className="rounded-md border border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-200 hover:border-white hover:text-white transition-colors"
								>
									Logout
								</button>
							) : (
								<Link
									to="/login"
									className="rounded-md bg-white px-3 py-1.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
								>
									Login
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}