import { CategoryDTO } from "../dto/common";
import { ProductDTO, ProductListDTO } from "../dto/product";

export const GetAvailableProducts = async (
	onGetAvailableProducts?: (data: ProductListDTO) => void,
	onFailed?: (e: string) => void
) => {
	try {
		const res = await fetch(`${__API_URL__}/api/Product/products/`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return;

		const data: ProductListDTO = await res.json();
		onGetAvailableProducts?.(data);
	} catch(e) {
		onFailed?.(`Error :${e}`);
	}
};
export const GetAvailableProductsByUser = async (
	onGetAvailableProducts?: (data: ProductListDTO) => void,
	onFailed?: (e: string) => void
) => {
	try {
		const res = await fetch(`${__API_URL__}/api/Product/manage-products/`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return;

		const data: ProductListDTO = await res.json();
		onGetAvailableProducts?.(data);
	} catch(e) {
		onFailed?.(`Error: ${e}`);
	}
};

export const CreateNewProduct = async (dto: ProductDTO): Promise<ProductDTO[]> => {
	try {
		const res = await fetch(`${__API_URL__}/api/Product/create/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(dto)
		});

		if (!res.ok) return [];

		const data = await res.json();

		if (data && Array.isArray(data.products)) {
			return data.products;
		} else {
			return [];
		}
	} catch {
		return [];
	}
};

export const GetProductCategories = async (): Promise<CategoryDTO[]> => {
	try {
		const res = await fetch(`${__API_URL__}/api/Product/categories`,
			{
				method: "GET",
				credentials: "include"
			});
		if (!res.ok) return [];

		const data = await res.json();
		if (data && Array.isArray(data.categories)) {
			return data.categories;
		}
		else return [];
	}
	catch {
		return [];
	}
};