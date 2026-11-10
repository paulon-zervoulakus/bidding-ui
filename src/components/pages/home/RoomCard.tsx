import React, { useEffect, useState } from "react";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";
import { Settings } from "lucide-react";
import { useFlashOnChange } from "../../../hooks/useFlashOnChange";
import { FlashWrap } from "../../wrapper/FlashWrap";

interface RoomCardProps {
  room: AuctionRoomDTO;
  currentUserId: number;
  onJoin: () => void;
  onLeave: () => void;
  onClose: () => void;
  onEdit: (room: AuctionRoomDTO) => void;
  isMember: boolean;
  canClose: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  currentUserId,
  onJoin,
  onLeave,
  onClose,
  onEdit,
  isMember,
  canClose,
}) => {

  const isHost = room.hostId === currentUserId;

  const statusColor =
    room.status === 1
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-600";

  const formatPrice = (price: number) =>
    `₱${price.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  // const groupNameFlash = useFlashOnChange(room.groupName);
  const titleFlash = useFlashOnChange(room.title);

  return (
    <div className="min-w-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200">
      {/* Room title and status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`text-base sm:text-lg font-bold truncate transition-colors duration-500 text-gray-900" `}>
            {room.groupName}
          </h3>
          <p className={ `text-sm mt-1 transition-colors duration-500 ${titleFlash ? "text-amber-500":"text-gray-900"}`}>
            Title: {room.title}
          </p>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {room.description || "No description"}
          </p>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap px-2.5 py-2 rounded-full text-xs font-medium ${statusColor}`}
        >
          {room.status === 1
            ? "Active"
            : room.status === 2
              ? "Closed"
              : "Cancelled"}
        </span>
        <button
          type="button"
          onClick={() => onEdit(room)}
          title="Configure room"
          aria-label={`Configure ${room.title}`}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Room metadata */}
      <div className="my-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
        <span className="max-w-full truncate">
          Host: {room.hostUserName}
        </span>
        <span>👥 {room.memberCount} members</span>
        <span>📦 {room.productCount} products</span>
        <span>🕒 {room.createdAt}</span>
      </div>

      {/* Products */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          Auction Products ({room.roomProducts?.length ?? 0})
        </h4>

        {!room.roomProducts?.length ? (
          <p className="text-sm text-gray-500 py-3">
            No products have been added to this room.
          </p>
        ) : (
          <div className="space-y-3">
            {room.roomProducts.map((product) => (
              <div
                key={product.productId}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name: {product.productDetails.title}</p>
                    <p className="text-xs text-gray-500">Retail Price: ${product.productDetails.price}</p>
                    <p className="text-xs text-gray-500">
                      Product ID: {product.productDetails.id}, Room ID: {product.id}
                    </p>
                  </div>

                  <span className="text-lg font-bold text-indigo-600 whitespace-nowrap">
                    <FlashWrap value={formatPrice(product.lastBidPrice)} />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Starting bid</p>
                    <p className="font-medium text-gray-800">
                      <FlashWrap value={formatPrice(product.startingBidPrice)} />
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Minimum bid increment</p>
                    <p className="font-medium text-gray-800">
                      <FlashWrap value={formatPrice(product.minimumBidIncrement)} />
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Bidding period</p>
                    <p className="text-gray-700">
                      {formatDateTime(product.startingBidTime)}
                    </p>
                    <p className="text-gray-700">
                      Until {formatDateTime(product.endBidTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room actions */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2 sm:gap-3">
        {isMember ? (
          <button
            onClick={onLeave}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Leave
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Join Room
          </button>
        )}

        {canClose && isHost && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
