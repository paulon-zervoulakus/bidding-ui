import Footer from "./layouts/footer";
import Navigation from "./layouts/navigation";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
	return (
		<div className="d-flex flex-column min-vh-100">
			<Navigation />
			<Outlet />
			<Footer />
		</div>
	);
};
export default Layout;
