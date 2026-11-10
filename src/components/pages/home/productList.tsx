import { useEffect, useState } from "react";
import { GetAvailableProducts } from "../../../hooks/useProducts";
import { ProductDTO } from "../../../dto/product";

const ProductList: React.FC = () => {
	const [products, setProducts] = useState<ProductDTO[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			const productLists = await GetAvailableProducts();
			setProducts(productLists);
		};
		fetchProducts();
	}, []);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
			{products.length === 0 ? (
				<p className="col-span-full text-center text-gray-500 py-8">Loading products...</p>
			) : (
				products.map((product) => (
					<div
						key={product.id}
						className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0"
					>
						<div className="p-4 sm:p-5">
							<h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{product.title}</h3>
							<p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
							<div className="flex items-center justify-between gap-3 mt-4">
								<span className="text-green-600 font-bold truncate">${product.price}</span>
								<button className="shrink-0 bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
									Bid Now
								</button>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default ProductList;
