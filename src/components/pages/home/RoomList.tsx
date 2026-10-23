import React, { useContext, useEffect, useState } from "react";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";
import { GetAuctionRooms, JoinAuctionRoom, LeaveAuctionRoom, CloseAuctionRoom } from "../../../hooks/useAuctionRooms";
import { UserContext } from "../../../context/userContextProvider";
import RoomCard from "./RoomCard";

const RoomList: React.FC = () => {
    const context = useContext(UserContext);
    const user = context?.user;
    const currentUserId = user?.id ?? 0;
    const [rooms, setRooms] = useState<AuctionRoomDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState<Set<number>>(new Set());
    const [leaving, setLeaving] = useState<Set<number>>(new Set());
    const [closing, setClosing] = useState<Set<number>>(new Set());

    const fetchRooms = async () => {
        setLoading(true);
        const data = await GetAuctionRooms();
        setRooms(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoin = async (roomId: number) => {
        setJoining((prev) => new Set([...prev, roomId]));
        try {
            const success = await JoinAuctionRoom({ auctionRoomId: roomId });
            if (success) {
                fetchRooms();
            }
        } finally {
            setJoining((prev) => {
                const next = new Set(prev);
                next.delete(roomId);
                return next;
            });
        }
    };

    const handleLeave = async (roomId: number) => {
        setLeaving((prev) => new Set([...prev, roomId]));
        try {
            const success = await LeaveAuctionRoom({ auctionRoomId: roomId });
            if (success) {
                fetchRooms();
            }
        } finally {
            setLeaving((prev) => {
                const next = new Set(prev);
                next.delete(roomId);
                return next;
            });
        }
    };

    const handleClose = async (roomId: number) => {
        setClosing((prev) => new Set([...prev, roomId]));
        try {
            const success = await CloseAuctionRoom(roomId);
            if (success) {
                fetchRooms();
            }
        } finally {
            setClosing((prev) => {
                const next = new Set(prev);
                next.delete(roomId);
                return next;
            });
        }
    };

    const canCreate = user?.role === 3 || user?.role === 4;

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Auction Rooms</h2>
                {canCreate && (
                    <button
                        onClick={() => {
                            const event = new CustomEvent("open-create-room");
                            window.dispatchEvent(event);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        + Create Room
                    </button>
                )}
            </div>

            {!canCreate && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                        Only Sellers and Administrators can create auction rooms.
                    </p>
                </div>
            )}

            {rooms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">No active auction rooms yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => {
                        const isMember = room.memberCount > 0;
                        const canClose = canCreate && room.hostId === currentUserId;
                        return (
                            <RoomCard
                                key={room.id}
                                room={room}
                                currentUserId={currentUserId}
                                onJoin={() => handleJoin(room.id)}
                                onLeave={() => handleLeave(room.id)}
                                onClose={() => handleClose(room.id)}
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
