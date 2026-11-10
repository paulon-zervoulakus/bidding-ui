export enum RoomStatusEnum {
    inActive = 0,
    active = 1,
    closed = 2,
    cancelled = 3,
    ended = 4
}

export enum ConditionEnum {
	new = 0,
	openBox = 1,
	refurbished = 2,
	usedLikeNew = 3,
	usedGood = 4,
	usedAcceptable = 5,
	partsOut = 6
}

export interface CategoryDTO {
	id: number;
	categoryName: string;
	parentCategoryId: number;
}

export interface SellerDTO {
	id: number;
	username: string;
}