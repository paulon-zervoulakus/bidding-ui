import React, { useContext, useEffect, useState } from "react";
import ProductList from "./productList";
import Chatbox from "./chatbox";
import { UserContext } from "../../../context/userContextProvider";

const HomeIndex: React.FC = () => {
	const [fullName, setFullName] = useState("");
	const context = useContext(UserContext);
	useEffect(() => {
		if(context) {
			const { user } = context;
			setFullName(user.fullName);
		}
	},[context]);
	return (
		<main className="flex justify-center">
			<div className="w-full mt-5">
				<h1 className="text-3xl">Welcome to Lobby - {fullName}</h1>
				<p>
					This is the main content area. Add your components and
					content here.
				</p>
				<div className="bg-gray-200 flex flex-1 container p-6 space-x-4" aria-placeholder="Thumbnails">
					<ProductList />
				</div>
				<div className="container space-x-4 py-4" aria-placeholder="Chatbox">
					<Chatbox />
				</div>

			</div>
		</main>
	);
};

export default HomeIndex;
