import React, { useContext, useEffect, useState } from "react";
import ProductList from "./productList";
import Chatbox from "./chatbox";
import AuctionRooms from "./AuctionRooms";
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

	const canCreate = context?.user?.role === 3 || context?.user?.role === 4;

	return (
		<main className="min-h-screen bg-slate-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Welcome to Lobby, {fullName}</h1>
					<p className="text-gray-600 mt-2">
						Browse products, join live auctions, and chat with other bidders.
					</p>
				</div>

				<div className="lg:grid lg:grid-cols-3 lg:gap-8">
					<div className="lg:col-span-2 space-y-8">
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Products</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								<ProductList />
							</div>
						</section>

						<section className="mt-8">
							<AuctionRooms />
						</section>
					</div>

					<div className="space-y-8">
						{canCreate ? (
							<div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
								<h2 className="text-lg font-bold text-gray-900 mb-3">Host Controls</h2>
								<p className="text-gray-600 text-sm mb-4">
									Create and manage your own auction rooms as a {context?.user?.role === 3 ? "Administrator" : "Seller"}.
								</p>
							</div>
						) : (
							<div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
								<h2 className="text-lg font-bold text-amber-800 mb-3">Host an Auction</h2>
								<p className="text-amber-700 text-sm mb-4">
									Upgrade to Seller or Administrator to create live auction rooms.
								</p>
							</div>
						)}

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h2 className="text-lg font-bold text-gray-900 mb-4">Live Chat</h2>
							<Chatbox />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default HomeIndex;
