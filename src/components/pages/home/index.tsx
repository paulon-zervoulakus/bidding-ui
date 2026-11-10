import React, { useContext, useEffect, useState } from "react";
import ProductList from "./ProductList";
import Chatbox from "./Chatbox";
import AuctionRooms from "./AuctionRooms";
import CreateProductForm from "./CreateProductForm";
import { UserContext } from "../../../context/userContextProvider";

const HomeIndex: React.FC = () => {
	const [fullName, setFullName] = useState("");
	const context = useContext(UserContext);
	const canCreate = context?.user?.role === 3 || context?.user?.role === 4;
	useEffect(() => {
		if (context) {
			const { user } = context;
			setFullName(user.fullName);
		}
	}, [context]);

	const [isProductFormOpen, setIsProductFormOpen] = useState(false);
	const [productsVersion, setProductsVersion] = useState(0);

	return (
		<main className="min-h-screen bg-slate-50 py-4 sm:py-8 lg:py-12">
			<div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
				<div className="mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Welcome to Lobby, {fullName}
					</h1>
					<p className="text-gray-600 mt-2 sm:mt-3">
						Browse products, join live auctions, and chat with other bidders.
					</p>
				</div>

				{/* Mobile: single column. Desktop: 2/3 content, 1/3 sidebar */}
				<div className="space-y-8 lg:grid lg:gap-8 lg:space-y-0">
					{/* min-w-0: grid items default to min-width:auto and overflow their track */}
					<div className="lg:col-span-2 min-w-0 space-y-8">
						<section>
							<div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
								<h2 className="text-lg sm:text-xl font-semibold text-gray-900">
									Featured Products
								</h2>
								{canCreate && (
									<button
										onClick={() => setIsProductFormOpen(true)}
										className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
									>
										+ Create Product
									</button>
								)}
							</div>
							{/* key change remounts the list, which refetches after a product is created */}
							<ProductList key={productsVersion} />
						</section>

						<section>
							<AuctionRooms />
						</section>
					</div>


				</div>

				{/* Full width so the two-column chat has room */}
				<section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
						Live Chat
					</h2>
					<Chatbox />
				</section>
			</div>

			{isProductFormOpen && (
				<CreateProductForm
					onClose={() => setIsProductFormOpen(false)}
					onSuccess={() => setProductsVersion((v) => v + 1)}
				/>
			)}
		</main>
	);
};

export default HomeIndex;