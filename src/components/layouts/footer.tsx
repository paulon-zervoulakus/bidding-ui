import React from "react";

const Footer: React.FC = () => {
	return (
		<footer className="bg-gray-800 text-white py-4">
			<div className="container">
				<div className="row">
					<div className="col-md-4">
						<h5>About Us</h5>
						<p>
							We are a company committed to providing the best
							services in the industry.
						</p>
					</div>
					<div className="col-md-4 text-center">
						<h5>Quick Links</h5>
						<ul className="nav flex-column">
							<li className="nav-item">
								<a href="#" className="nav-link text-white">
									Home
								</a>
							</li>
							<li className="nav-item">
								<a href="#" className="nav-link text-white">
									Services
								</a>
							</li>
							<li className="nav-item">
								<a href="#" className="nav-link text-white">
									Contact
								</a>
							</li>
						</ul>
					</div>
					<div className="col-md-4 text-md-end text-center">
						<h5>Follow Us</h5>
						<a
							href="#"
							className="btn btn-outline-light btn-sm m-1"
						>
							Facebook
						</a>
						<a
							href="#"
							className="btn btn-outline-light btn-sm m-1"
						>
							Twitter
						</a>
						<a
							href="#"
							className="btn btn-outline-light btn-sm m-1"
						>
							Instagram
						</a>
					</div>
				</div>
				<div className="text-center mt-4">
					<p className="mb-0">
						&copy; 2024 Your Company. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
