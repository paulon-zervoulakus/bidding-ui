import React from "react";
import { Link } from "react-router-dom";

const quickLinks = [
	{ label: "Home", to: "/" },
	{ label: "Services", to: "/services" },
	{ label: "Contact", to: "/contact" },
];

const socialLinks = [
	{ label: "Facebook", href: "#" },
	{ label: "Twitter", href: "#" },
	{ label: "Instagram", href: "#" },
];

const Footer: React.FC = () => {
	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
				<div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
					{/* About */}
					<div>
						<h5 className="text-sm font-semibold uppercase tracking-wider text-white">
							About Us
						</h5>
						<p className="mt-3 text-sm leading-relaxed text-gray-400 max-w-sm mx-auto md:mx-0">
							We are a company committed to providing the best
							services in the industry.
						</p>
					</div>

					{/* Quick links */}
					<nav aria-label="Footer" className="md:justify-self-center">
						<h5 className="text-sm font-semibold uppercase tracking-wider text-white">
							Quick Links
						</h5>
						<ul className="mt-3 space-y-2 text-sm">
							{quickLinks.map((link) => (
								<li key={link.label}>
									<Link
										to={link.to}
										className="text-gray-400 hover:text-white transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Social */}
					<div className="md:justify-self-end">
						<h5 className="text-sm font-semibold uppercase tracking-wider text-white">
							Follow Us
						</h5>
						<div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
							{socialLinks.map((link) => (
								<a
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-full border border-gray-600 px-3 py-1 text-xs font-medium text-gray-300 hover:border-white hover:text-white transition-colors"
								>
									{link.label}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
					&copy; {new Date().getFullYear()} Your Company. All rights reserved.
				</div>
			</div>
		</footer>
	);
};

export default Footer;