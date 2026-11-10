import React from "react";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";

interface RoomHeaderProps {
	room: AuctionRoomDTO;
	onLeave: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, onLeave }) => {
	const statusColor =
		room.status === 1
			? "bg-green-100 text-green-700"
			: room.status === 2
			? "bg-gray-100 text-gray-600"
			: "bg-red-100 text-red-700";

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
				<div className="min-w-0">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
						{room.title}
					</h1>
					<p className="text-gray-600 text-sm mt-1">
						{room.description || "No description"}
					</p>
					<div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
						<span>Host: {room.hostUserName}</span>
						<span>•</span>
						<span>👥 {room.memberCount} members</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
					>
						{room.status === 1 ? "Active" : room.status === 2 ? "Closed" : "Cancelled"}
					</span>
					<button
						onClick={onLeave}
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
					>
						Leave Room
					</button>
				</div>
			</div>
		</div>
	);
};

export default RoomHeader;
