import UserContextProvider from "./context/userContextProvider";
import Layout from "./components/layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeIndex from "./components/pages/home";
import PrivateRoute from "./components/routing/PrivateRoute";
import Login from "./components/pages/authentication/Login";
import Register from "./components/pages/registration/Register";
import About from "./components/pages/aboutus";
import AccountIndex from "./components/pages/account";

export default function App() {
	const NotFound = () => <h1>Page Not Found</h1>;

	return (
		<UserContextProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<Layout />}>
						{/* Public routtes */}
						{/* <Route element={<PublicRoute />}> */}
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/aboutus" element={<About />} />
						{/* </Route> */}

						{/* Private routes */}
						<Route element={<PrivateRoute />}>
							<Route path="/" element={<HomeIndex />} />
							<Route path="/account" element={<AccountIndex />} />
							{/* Add protected routes here */}
						</Route>

						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</UserContextProvider>
	);
}
