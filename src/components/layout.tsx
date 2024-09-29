import Footer from "./layouts/footer";
import Navigation from "./layouts/navigation";
import Content  from "./layouts/content";

const Layout: React.FC = () => {
	return (
		<div className="w-full min-h-10 bg-gray-50">
			<Navigation />
			<Content />
			<Footer />
		</div>
	);
};
export default Layout;
