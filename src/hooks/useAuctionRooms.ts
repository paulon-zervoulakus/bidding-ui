import {
	AuctionRoomDTO,
	AuctionRoomListDTO,
} from "../dto/auctionRoom";
import { ProductDTO } from "../dto/product";

/**
 * Get manage rooms or room that a user joined in *
 * @param onGetManageAuctonRooms
 * @returns
 */
export const GetManageAuctionRooms = async (
	onGetAuctonRooms?: (data: AuctionRoomDTO[]) => void
): Promise<AuctionRoomDTO[]> => {
		const res = await fetch(`${__API_URL__}/api/AuctionRooms/get-manage-rooms`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return [];

		const data: AuctionRoomListDTO = await res.json();

		onGetAuctonRooms?.(data.rooms);
		return data.rooms ?? [];

};

export const GetAuctionRooms = async (
	onGetAuctonRooms?: (data: AuctionRoomDTO[]) => void
): Promise<AuctionRoomDTO[]> => {
		const res = await fetch(`${__API_URL__}/api/AuctionRooms/`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) return [];

		const data: AuctionRoomListDTO = await res.json();

		onGetAuctonRooms?.(data.rooms);
		return data.rooms ?? [];

};

export const CreateAuctionRoom = async (
	dto: AuctionRoomDTO
): Promise<AuctionRoomDTO | null> => {
	try {
		const response = await fetch(`${__API_URL__}/api/AuctionRooms/save-room`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(dto),
		});

		if (!response.ok) return null;

		const auctionRoom: AuctionRoomDTO = await response.json();

		return auctionRoom;
	} catch {
		return null;
	}
};

// export const JoinAuctionRoom = async (
// 	dto: JoinAuctionRoomRequestDTO
// ): Promise<boolean> => {
// 	try {
// 		const res = await fetch(`${__API_URL__}/api/AuctionRooms/join`, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			credentials: "include",
// 			body: JSON.stringify(dto),
// 		});
// 		return res.status === 200;
// 	} catch {
// 		return false;
// 	}
// };

// export const LeaveAuctionRoom = async (
// 	dto: LeaveAuctionRoomRequestDTO
// ): Promise<boolean> => {
// 	try {
// 		const res = await fetch(`${__API_URL__}/api/AuctionRooms/leave`, {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			credentials: "include",
// 			body: JSON.stringify(dto),
// 		});
// 		return res.status === 200;
// 	} catch {
// 		return false;
// 	}
// };

export const AddProductToRoom = async (
	roomId: number,
	dto: ProductDTO
): Promise<boolean> => {
	try {
		const res = await fetch(`${__API_URL__}/api/AuctionRooms/${roomId}/products`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(dto),
		});
		return res.status === 200;
	} catch {
		return false;
	}
};
export const CloseProductToRoom = async (
	roomId: number
): Promise<boolean> => {
	try {
		const res = await fetch(`${__API_URL__}/api/AuctionRooms/close/${roomId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		return res.status === 200;
	} catch {
		return false;
	}
};
