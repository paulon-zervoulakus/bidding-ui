import React, { useContext, useState } from "react";
import { UserContext } from "../../../context/userContextProvider";
import RoomList from "./RoomList";
import CreateRoomForm from "./CreateRoomForm";

const AuctionRooms: React.FC = () => {
    const context = useContext(UserContext);
    const user = context?.user;
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const canCreate = user?.role === 3 || user?.role === 4;

    return (
        <div className="space-y-6">
            {canCreate && (
                <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Host an Auction</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Create a live auction room. Only Sellers and Administrators can host rooms.
                    </p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        + Create New Room
                    </button>
                </div>
            )}

            {!canCreate && user?.isLoggedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">Upgrade to Host</h3>
                    <p className="text-amber-700 text-sm">
                        Only Sellers and Administrators can create auction rooms. Contact support to upgrade your account.
                    </p>
                </div>
            )}

            <RoomList />

            {isCreateOpen && (
                <CreateRoomForm
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={() => setIsCreateOpen(false)}
                />
            )}
        </div>
    );
};

export default AuctionRooms;
