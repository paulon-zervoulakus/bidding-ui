import React from "react";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";
import { JoinAuctionRoom, LeaveAuctionRoom, CloseAuctionRoom } from "../../../hooks/useAuctionRooms";
import { UserContext } from "../../../context/userContextProvider";
import { useContext, useState } from "react";

interface RoomCardProps {
    room: AuctionRoomDTO;
    currentUserId: number;
    onJoin: () => void;
    onLeave: () => void;
    onClose: () => void;
    isMember: boolean;
    canClose: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
    room,
    currentUserId,
    onJoin,
    onLeave,
    onClose,
    isMember,
    canClose,
}) => {
    const isHost = room.hostId === currentUserId;
    const statusColor =
        room.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                        {room.description || "No description"}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {room.status === 1 ? "Active" : room.status === 2 ? "Closed" : "Cancelled"}
                </span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-indigo-600">
                        ₱{room.currentPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                        Host: {room.hostUserName}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>👥 {room.memberCount}</span>
                    <span>•</span>
                    <span>🕒 {new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex gap-3">
                {isMember ? (
                    <button
                        onClick={onLeave}
                        disabled={!isMember}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                        Leave
                    </button>
                ) : (
                    <button
                        onClick={onJoin}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        Join Room
                    </button>
                )}

                {canClose && isHost && (
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomCard;
