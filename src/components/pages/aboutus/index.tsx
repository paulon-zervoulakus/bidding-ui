import React from "react";

const About: React.FC = () => {
	return (
		<main className="flex-grow-1">
			<div className="container">
				<h1>About Us</h1>
				<p>
					Welcome to our website! We are committed to providing you
					with the best service and experience possible.
				</p>
				<p>
					Our team is passionate about what we do, and we strive to
					improve every day. Whether you’re looking for the latest
					products, seeking support, or just want to learn more about
					our mission, we are here to help.
				</p>
				<p>
					Feel free to browse through our website to learn more about
					what we offer. If you have any questions, don’t hesitate to
					contact us.
				</p>
				<h2>Our Mission</h2>
				<p>
					Our mission is to deliver high-quality products and services
					that exceed our customers' expectations. We believe in
					building long-term relationships with our clients by
					providing outstanding customer service and continuous
					innovation.
				</p>
				<h2>Contact Us</h2>
				<p>
					Have questions or need assistance? Reach out to us at{" "}
					<a href="mailto:info@example.com">info@example.com</a> or
					call us at (123) 456-7890.
				</p>
			</div>
		</main>
	);
};

export default About;
