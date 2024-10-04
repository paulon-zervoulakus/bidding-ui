export interface ProductDTO
{
    id: number;
	title: string;
	description: string;
	price: number;
    quantity: number;
    sku: string;
    // seller
    seller: SellerDTO;
    condition: ConditionEnum;
    productCategory: CategoryDTO;

}
export interface CategoryDTO
{
    id: number;
    categoryName: string;
}
export interface SellerDTO
{
    id: number;
    username: string;
}

enum ConditionEnum {
    new = 0,
    openBox = 1,
    refurbished = 2,
    usedLikeNew = 3,
    usedGood = 4,
    usedAcceptable = 5,
    forPartsOrNotWorking = 6
}