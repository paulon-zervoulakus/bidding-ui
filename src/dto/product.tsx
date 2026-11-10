import { ConditionEnum, CategoryDTO, SellerDTO } from "./common";
export interface ProductDTO {
	id?: number;
	title: string;
	description: string;
	price: string;
	quantity: string;
	sku: string;
	condition: ConditionEnum;
	productCategory?: CategoryDTO[];
	seller?: SellerDTO;
}

