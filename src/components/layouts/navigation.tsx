import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContextProvider";
import { logout as hookLogout } from "../../hooks/account";
import { Link, useNavigate } from "react-router-dom";


export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const context = useContext(UserContext);
	const logout = () => {
		if (context) {
			const { setUser } = context;
            localStorage.setItem('logout', Date.now().toString()); // Notify other tabs
			hookLogout(setUser);
			navigate("/login");
		} else {
			console.log("Unable to logout");
		}
	};
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'logout') {
                console.log('Logged out from another tab.');
                window.location.href = '/login'; // Redirect to login
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.addEventListener('storage', handleStorageChange);
    },[])
	var authLink = (
		<li className="nav-item">
			<Link className="link-primary" to="/login">
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
        <div className="mx-auto bg-gray-800 md:flex md:flex-row md:justify-between">
            <nav className="p-4 mx-auto flex justify-between">
                <a className="text-white text-lg font-bold" href="/">
                    Bidding App
                </a>
                <button
                    className="md:hidden items-center text-white focus:outline-none"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)} // Assuming you manage the open state
                    aria-controls="navbarSupportedContent"
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </nav>
            <div className="mx-auto items-center px-4 pb-4 md:pt-4">

                <div className={`flex-col md:flex md:flex-row md:items-center ${isOpen ? 'flex' : 'hidden'}`} id="navbarSupportedContent">
                    <ul className="flex flex-col md:flex-row md:space-x-4 md:justify-end">
                        <li>
                            <Link
                                className="text-gray-300 hover:text-white active"
                                aria-current="page"
                                to="/"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="text-gray-300 hover:text-white"
                                to="/aboutus"
                            >
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="text-gray-300 hover:text-white"
                                to="/services"
                            >
                                Services
                            </Link>
                        </li>
                        {authLink}
                    </ul>

                    <form className="flex items-center mt-4 md:mt-0 md:ml-4" role="search">
                        <input
                            className="md:flex-grow bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                        />
                        <button
                            className="ml-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            type="submit"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>


        </div>

	);
}
