import { useContext } from "react";
import { UserContext } from "../../context/userContextProvider";
import { logout as hookLogout } from "../../hooks/account";
import { Link } from "react-router-dom";

export default function Navigation() {
	const context = useContext(UserContext);
	const logout = () => {
		if (context) {
			const { setUser } = context;
			hookLogout(setUser);
		} else {
			console.log("Unable to logout");
		}
	};
	var authLink = (
		<li className="nav-item">
			<Link className="nav-link link-primary" to="/login">
				Login
			</Link>
		</li>
	);
	if (context) {
		const { user } = context;
		if (user.isLoggedIn) {
			authLink = (
				<li className="nav-item">
					<a
						className="nav-link link-primary"
						href="#"
						onClick={(e) => {
							e.preventDefault(); // Prevent default anchor behavior
							logout(); // Call the logout function
						}}
					>
						Logout
					</a>
				</li>
			);
		}
	}
	return (
		<nav className="navbar navbar-expand-lg bg-body-tertiary">
			<div className="container-fluid">
				<a className="navbar-brand" href="/">
					Bidding App
				</a>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div
					className="collapse navbar-collapse"
					id="navbarSupportedContent"
				>
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link
								className="nav-link active"
								aria-current="page"
								to="/"
							>
								Home App
							</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/aboutus">
								About Us
							</Link>
						</li>
						{authLink}
					</ul>

					<form className="d-flex" role="search">
						<input
							className="form-control me-2"
							type="search"
							placeholder="Search"
							aria-label="Search"
						/>
						<button
							className="btn btn-outline-success"
							type="submit"
						>
							Search
						</button>
					</form>
				</div>
			</div>
		</nav>
	);
}
