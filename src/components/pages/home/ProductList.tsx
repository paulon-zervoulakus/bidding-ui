import { ProductListDTO } from "../../../dto/product";


const ProductList: React.FC<ProductListDTO> = (ProductProps) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
			{ProductProps.products == undefined ? (
				<p className="col-span-full text-center text-gray-500 py-8">Loading products...</p>
			) : (
				ProductProps.products.map((product) => (
					<div
						key={product.id}
						className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0"
					>
						<div className="p-4 sm:p-5">
							<h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{product.title}</h3>
							<p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
							<p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.seller?.userName}</p>
							<div className="flex items-center justify-between gap-3 mt-4">
								<span className="text-green-600 font-bold truncate">${product.price}</span>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default ProductList;
