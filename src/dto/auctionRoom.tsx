import { RoomStatusEnum, RoomVisibilityEnum } from "./common";
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
    visibility: RoomVisibilityEnum;
    createdAt?: string;
    memberCount?: number;
    members?: RoomMemberDTO[];
    productCount?: number;
    roomProducts?: RoomProductDTO[];
}
export interface RoomMemberDTO
{
    userId: number;
    userName: string;
    email: string;
    joinedAt: string;
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
    bidHistory?: BidHistoryDTO[];
}
export interface BidHistoryDTO
{
  id: number;
  bid: number;
  bidTimestamp: string;
  auctionRoomProductId: number;
  currentBidder: CurrentBidder
}
export interface CurrentBidder
{
  id: number;
  userName: string;
  email: string;
  fullName: string;
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
export interface RoomIndexDTO
{
    roomId: number;
    groupName: string;
}
export type RoomIndexListDTO = RoomIndexDTO[];

// Define the ConnectedUsersDTO interface
export interface ConnectedUserDTO
{
  email: string;      // The user's email address
  fullname: string;   // The user's full name
  avatarSrc: string;  // The URL of the user's avatar image
}
export type RoomMember = ConnectedUserDTO & {
  connectionId?: string,
  groupName?: string,
  roomId?: number,
  userId?: number
};

export interface IncomingMessagesDTO {
  user: string;
  message: string;
}
export interface AuctionBidDTO
{
  roomProductId: number;
  roomId: number;
  amount: number;
  bidder: string;
  timestamp?: string;
}
export interface IncomingAuctionBidDTO extends AuctionBidDTO
{
  room: AuctionRoomDTO;
}
export interface OutgoingAuctionBidDTO
{
  roomProductId: number;
  amount: number
}
