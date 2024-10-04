import axios from "./initAxios";
import { ProductDTO } from "../dto/product";

export const GetAvailableProducts = async (): Promise<ProductDTO[]>  => {
	try {
		const res = await axios.get<{products: ProductDTO[]}>(`/api/Product/products/`, {
			withCredentials: true,
		});
		if (
			res.data &&
			typeof Array.isArray(res.data.products)
		) {
            return res.data.products;
        }else{
            return [];
        }
    }catch(err){
        return [];
    }
}
