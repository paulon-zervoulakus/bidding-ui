import axios from "./initAxios";
import {
    AuctionRoomDTO,
    AuctionRoomsResponse,
    CreateAuctionRoomRequestDTO,
    JoinAuctionRoomRequestDTO,
    LeaveAuctionRoomRequestDTO,
} from "../dto/auctionRoom";

export const GetAuctionRooms = async (): Promise<AuctionRoomDTO[]> => {
    try {
        const res = await axios.get<AuctionRoomsResponse>(`/api/AuctionRooms/`, {
            withCredentials: true,
        });
        if (res.data && Array.isArray(res.data.rooms)) {
            return res.data.rooms;
        }
        return [];
    } catch {
        return [];
    }
};

export const CreateAuctionRoom = async (
    dto: CreateAuctionRoomRequestDTO
): Promise<AuctionRoomDTO | null> => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_DEV_API_URL}/api/AuctionRooms/create`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(dto),
            }
        );

        const auctionRoom: AuctionRoomDTO = await response.json();

        return auctionRoom;
    } catch {
        return null;
    }
};

export const JoinAuctionRoom = async (
    dto: JoinAuctionRoomRequestDTO
): Promise<boolean> => {
    try {
        const res = await axios.post(`/api/AuctionRooms/join`, dto, {
            withCredentials: true,
        });
        return res.status === 200;
    } catch {
        return false;
    }
};

export const LeaveAuctionRoom = async (
    dto: LeaveAuctionRoomRequestDTO
): Promise<boolean> => {
    try {
        const res = await axios.post(`/api/AuctionRooms/leave`, dto, {
            withCredentials: true,
        });
        return res.status === 200;
    } catch {
        return false;
    }
};

export const CloseAuctionRoom = async (roomId: number): Promise<boolean> => {
    try {
        const res = await axios.post(
            `/api/AuctionRooms/close/${roomId}`,
            {},
            { withCredentials: true }
        );
        return res.status === 200;
    } catch {
        return false;
    }
};
