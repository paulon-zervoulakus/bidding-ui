export interface AuctionRoomDTO {
    id: number;
    groupName: string;
    title: string;
    description?: string;
    hostId: number;
    hostUserName: string;
    status: RoomStatusEnum;
    currentPrice: number;
    createdAt: string;
    memberCount: number;
}

export interface CreateAuctionRoomRequestDTO {
    groupName: string;
    title: string;
    description?: string;
}

export interface JoinAuctionRoomRequestDTO {
    auctionRoomId: number;
}

export interface LeaveAuctionRoomRequestDTO {
    auctionRoomId: number;
}

export enum RoomStatusEnum {
    Active = 1,
    Closed = 2,
    Cancelled = 3
}

export interface AuctionRoomsResponse {
    rooms: AuctionRoomDTO[];
}
