import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";

import { UserContext } from "../../../context/userContextProvider";
import { JoinAuctionRoom as SignalRJoinAuctionRoom, LeaveAuctionRoom as SignalRLeaveAuctionRoom } from "../../../hooks/signalRService";
import RoomCard from "./RoomCard";

interface RoomListProps {
	rooms?: AuctionRoomDTO[] | null;
	onCreate?: () => void;
	onEdit?: (room: AuctionRoomDTO) => void;
}

const RoomList: React.FC<RoomListProps> = (RoomListProps) => {
	const context = useContext(UserContext);
	const user = context?.user;
	const currentUserId = user?.id ?? 0;
	const navigate = useNavigate();


	const handleJoin = async (roomId: number) => {

		try {
			const room = RoomListProps?.rooms ? RoomListProps.rooms.find((r) => r.id === roomId) : false;
			if (room) {
				await SignalRJoinAuctionRoom(roomId, room.groupName);
				navigate(`/room/${roomId}`);
			}
		} catch {
			// SignalR join failed
			console.log("Error handleJoin");
		}
	};

	const handleLeave = async (roomId: number) => {

		try {
			const room = RoomListProps?.rooms ? RoomListProps.rooms.find((r) => r.id === roomId) : false;
			if (room) {
				await SignalRLeaveAuctionRoom(room.id, room.groupName);
			}
		} catch {
			// SignalR leave failed
			console.log("Error handleLeave");
		}
	};

	const handleClose = async (roomId: number) => {

		console.log("handleClose")
	};

	const canCreate = user?.role === 3 || user?.role === 4;



	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg sm:text-xl font-semibold text-gray-900">Manage/Joined Auction</h2>
				{canCreate && RoomListProps.onCreate && (
					<button
						onClick={RoomListProps.onCreate}
						className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
					>
						+ Create Room
					</button>
				)}
			</div>

			{RoomListProps.rooms?.length === 0 || RoomListProps?.rooms == null ? (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
					<p className="text-gray-500">No active auction rooms yet.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
					{ RoomListProps?.rooms.map((room) => {
						// TODO: Replace with actual membership check from API
						const isMember = false;
						const canClose = canCreate && room.hostId === currentUserId;
						return (
							<RoomCard
								key={room.id}
								room={room}
								currentUserId={currentUserId}
								onJoin={() => handleJoin(room.id)}
								onLeave={() => handleLeave(room.id)}
								onClose={() => handleClose(room.id)}
								onEdit={(room: AuctionRoomDTO) => RoomListProps.onEdit?RoomListProps.onEdit(room):null}
								isMember={isMember}
								canClose={canClose}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default RoomList;
