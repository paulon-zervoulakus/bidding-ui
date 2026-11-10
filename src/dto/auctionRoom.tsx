import { RoomStatusEnum } from "./common";
import { ProductDTO } from "./product";

export interface AuctionRoomDTO
{
    id: number;
    groupName: string;
    title: string;
    description?: string;
    hostId?: number;
    hostUserName?: string;
    status: RoomStatusEnum;
    createdAt?: string;
    memberCount?: number;
    productCount?: number;
    roomProducts?: RoomProductDTO[];
}
export interface RoomProductDTO
{
    id?: number;
    productId: number;
    startingBidPrice: number;
    lastBidPrice: number;
    minimumBidIncrement: number;
    startingBidTime: string;
    endBidTime: string;
    productDetails: ProductDTO;
}
export interface CreateEditAuctionRoomRequestDTO
{
    groupName: string;
    title: string;
    description?: string;
    productIds: number[];
    products?: RoomProductDTO[];
    newProducts: RoomProductDTO[],
}
export interface AuctionRoomListDTO
{
    rooms: AuctionRoomDTO[]
}