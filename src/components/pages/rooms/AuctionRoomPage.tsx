
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuctionRoomDTO, RoomProductDTO } from "../../../dto/auctionRoom";
import { GetAuctionRooms } from "../../../hooks/useAuctionRooms";
import {
  JoinAuctionRoom as SignalRJoinAuctionRoom,
  LeaveAuctionRoom as SignalRLeaveAuctionRoom,
  BroadcastReceiveBid,
  BroadcastUserJoinedRoom,
  BroadcastUserLeftRoom
} from "../../../hooks/signalRService";
import RoomHeader from "./RoomHeader";
import BidPanel from "./BidPanel";
import { BidDTO } from "../../../dto/signalr";

const formatPrice = (price: number) =>
  `₱${price.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AuctionRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<AuctionRoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [bids, setBids] = useState<BidDTO[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const activeProduct = useMemo(
    () =>
       room?.roomProducts ? room.roomProducts.find(
        (product) => product.id === activeProductId
      ):  null,
      [room, activeProductId]
  );

  // Current price belongs to the selected room product.
  const currentPrice = activeProduct?.lastBidPrice ?? 0;

  useEffect(() => {
    let cancelled = false;
    let joinedGroupName: string | null = null;
    let joinedRoomId: number = 0;
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        const rooms = await GetAuctionRooms();
        if (cancelled) return;

        const found = rooms.find((r) => r.id === Number(roomId));

        if (!found) {
          setError("Room not found");
          return;
        }

        setRoom(found);

        // Select the first product by default.
        const firstProduct = found.roomProducts?.[0];

        setActiveProductId(firstProduct?.id ?? null);
        // setBids([]);

        if (!firstProduct) {
          setError("This auction room has no products yet.");
          return;
        }

        await SignalRJoinAuctionRoom(found.id, found.groupName);

        if (cancelled) {
          await SignalRLeaveAuctionRoom(found.id, found.groupName).catch(() => {});
          return;
        }

        joinedGroupName = found.groupName;
        joinedRoomId = found.id;
        setIsJoined(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            `Failed to load auction room: ${(err as Error).message}`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoom();

    // Register listeners. Incoming bids must identify their roomProductId.
    BroadcastReceiveBid((newBids: BidDTO[]) => {
      if (cancelled) return;

      // setBids(newBids);
    });

    BroadcastUserJoinedRoom(setMembers);
    BroadcastUserLeftRoom(setMembers);

    return () => {
      cancelled = true;

      if (joinedGroupName) {
        SignalRLeaveAuctionRoom(joinedRoomId, joinedGroupName).catch(() => {});
      }
    };
  }, [roomId]);

  // Show only bids belonging to the selected product.
  // const activeProductBids = useMemo(
  //   () =>
  //     bids.filter(
  //       (bid) => bid.roomProductId === activeProductId
  //     ),
  //   [bids, activeProductId]
  // );

  const handleSelectProduct = (product: RoomProductDTO) => {
    setActiveProductId(product.id ?? null);
  };

  const handleLeaveRoom = async () => {
    if (room && isJoined) {
      try {
        await SignalRLeaveAuctionRoom(room.id, room.groupName);
      } catch {
        // Ignore disconnect errors.
      }
    }

    setIsJoined(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || "Room not found"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <RoomHeader room={room} onLeave={handleLeaveRoom} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main auction area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product selector */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Auction Products
                </h2>
                <span className="text-sm text-gray-500">
                  {room.roomProducts?.length} products
                </span>
              </div>

              {room.roomProducts?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No products are available in this room.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.roomProducts?.map((product) => {
                    const selected = product.id === activeProductId;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        aria-pressed={selected}
                        className={`text-left rounded-lg border p-4 transition-colors ${
                          selected
                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Product #{product.productId}
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              Room Product #{product.id}
                            </p>
                          </div>

                          {selected && (
                            <span className="shrink-0 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full px-2 py-1">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-xl font-bold text-indigo-600 mt-3">
                          {formatPrice(product.lastBidPrice)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Current price
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Selected product details */}
            {activeProduct && (
              <section className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-indigo-600">
                      Active bidding product
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      Product #{activeProduct.productId}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Room Product ID: {activeProduct.id}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold">
                    Selected for bidding
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <p className="text-sm text-indigo-700">
                      Current price
                    </p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                      {formatPrice(currentPrice)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Starting bid
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatPrice(activeProduct.startingBidPrice)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Minimum bid increment
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatPrice(activeProduct.minimumBidIncrement)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bidding starts</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {new Date(activeProduct.startingBidTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bidding ends</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {new Date(activeProduct.endBidTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Bid panel for the selected product */}
            {activeProduct && (
              <BidPanel
                room={room}
                currentPrice={currentPrice}
                bids={[]}
                isJoined={isJoined}
              />
            )}
          </div>

          {/* Participants */}
          <aside>
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                Participants
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {members.length} connected
              </p>

              <ul className="space-y-2">
                {members.length === 0 ? (
                  <li className="text-sm text-gray-400">
                    No participants yet
                  </li>
                ) : (
                  members.map((member, index) => (
                    <li
                      key={`${member}-${index}`}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {member}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default AuctionRoomPage;
