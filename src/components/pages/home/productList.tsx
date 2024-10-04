import { useEffect, useState } from "react";
import { GetAvailableProducts } from "../../../hooks/products";
import { ProductDTO } from "../../../dto/product";
const ProductList: React.FC = () => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    useEffect( () => {
        const fetchProducts = async () => {
            const productLists = await GetAvailableProducts(); // Fetch the products
            setProducts(productLists); // Ensure fetchedProducts is an array
        };
        fetchProducts()
    }, []);
    return (
        <section className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
                <p>Loading products...</p> // Show a message while fetching
            ) : (
                products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4">
                            <h2 className="text-lg font-bold">{product.title}</h2>
                            <p className="text-gray-500">{product.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-green-500 font-bold">${product.price}</span>
                                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Bid Now</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </section>
    )
}
export default ProductList;