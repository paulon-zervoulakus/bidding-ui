import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuctionBidDTO, AuctionRoomDTO, OutgoingAuctionBidDTO, RoomIndexDTO, RoomMember  } from "../../../dto/auctionRoom";
import { GetAuctionRoomById } from "../../../hooks/useAuctionRooms";
import {
  RegisterReceiveAuctionBid,
  RegisterUserJoinedRoom,
  // RegisterUserLeftRoom,
  RegisterReceiveRoomMessage,
  InvokeSendProductBid,
  InvokeSendRoomMessage,
  InvokeJoinAuctionRoom,
  InvokeLeaveAuctionRoom,
  StopConnection,
  StartConnection,
} from "../../../hooks/useSignalRServiceRoom";
import { UserContext } from "../../../context/userContextProvider";
import { RoomHeaderCard } from "./RoomHeaderCard";
import { ChatMessage} from "../../../helper/auctionRoom";

import { ProductSelector } from "./ProductSelector";
import { ActiveProductPanel } from "./ActiveProductPanel";
import { ParticipantList } from "./ParticipantList";
import { ChatPanel } from "./ChatPanel";
import { EnsureConnection } from "../../../hooks/useSignalRServiceRoom";


const AuctionRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const me = context?.user?.fullName ?? "";
  const started = useRef(false);

  const [room, setRoom] = useState<AuctionRoomDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [bids, setBids] = useState<AuctionBidDTO[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // One shared clock for phase badges and countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rooms are selected by productId: it is unique within a room and always present
  const activeProduct = useMemo(
    () => room?.roomProducts?.find((rp) => rp.productId === activeProductId) ?? null,
    [room, activeProductId]
  );

  const activeProductBids = useMemo(
    () => bids.filter((b) => b.roomProductId === activeProductId),
    [bids, activeProductId]
  );

  useEffect(() => {
    let cancelled = false;
    // let joined: { id: number; groupName: string } | null = null;
    let roomIndex: RoomIndexDTO | null = {roomId: 0, groupName: ""};


    const loadRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        const room = await GetAuctionRoomById(Number(roomId));

        if (!room) {
          setError("Room not found");
          return;
        }

        setRoom(room);
        setBids(
          (room.roomProducts ?? [])
            .flatMap((rp) =>
              (rp.bidHistory ?? []).map((b) => ({
                roomProductId: rp.productId,       // same ID the live handler and the product filter use
                bidder: b.currentBidder.fullName ?? "",
                amount: b.bid ?? 0,
                timestamp: b.bidTimestamp ?? "",
                roomId: room.id
              }))
            )
            .sort((a, b) => b.timestamp?.localeCompare(a.timestamp))   // newest first
        );
        setActiveProductId(room.roomProducts?.[0]?.productId ?? null);
        EnsureConnection().catch(console.error);
        // Listeners are registered immediately so nothing is missed while loading
        StartConnection();
        RegisterReceiveAuctionBid((dto: AuctionBidDTO) => {
          if (cancelled) return;
          setBids((prev) => [...[dto], ...prev]);
          setRoom((prev) =>
            prev
              ? {
                  ...prev,
                  roomProducts: prev.roomProducts?.map((rp) => {
                    const hit = dto.roomProductId === rp.productId;
                    return hit ? { ...rp, lastBidPrice: dto.amount } : rp;
                  }),
                }
              : prev
          );
        });
        RegisterUserJoinedRoom(setMembers);
        // RegisterUserLeftRoom(setMembers);
        RegisterReceiveRoomMessage((user: string, message: string) => {

          if (!cancelled)
            setChat((prev) =>
              [...prev, {user, message}]);
        });
        // Join even when there are no products yet, so chat and presence still work
        roomIndex = {
          roomId: room.id,
          groupName: room.groupName
        }as RoomIndexDTO;

        await InvokeJoinAuctionRoom(roomIndex);

        if (cancelled) {
          await InvokeLeaveAuctionRoom(roomIndex).catch(() => {});
          return;
        }

        setIsJoined(true);
      } catch (err) {
        if (!cancelled) setError(`Failed to load auction room: ${(err as Error).message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoom();

    return () => {
      if (started.current) return; // skip duplicate StrictMode invocation
      started.current = true;

      cancelled = true;
      if (roomIndex) InvokeLeaveAuctionRoom(roomIndex).catch(() => {});
      StopConnection();
    };
  }, [roomId]);

  const handleLeaveRoom = () => {
    navigate("/"); // unmounting runs the cleanup above, which leaves the room
  };

  const handleBid = async (amount: number) => {
    if (!room || activeProductId === null) return;

    const _out: OutgoingAuctionBidDTO = {
      amount:amount,
      roomProductId: activeProductId
    };
    await InvokeSendProductBid(_out);
  };

  const handleSendMessage = async (text: string) => {
    if (!room) return;
    await InvokeSendRoomMessage(room.id, room.groupName, text);
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
          <p className="text-red-600 mb-4">{error || "Room not found"}</p>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        <RoomHeaderCard room={room} onlineCount={members.length} onLeave={handleLeaveRoom} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auction area */}
          <div className="lg:col-span-2 min-w-0 space-y-6">
            <ProductSelector
              products={room.roomProducts ?? []}
              activeProductId={activeProductId}
              now={now}
              onSelect={setActiveProductId}
            />

            {activeProduct && (
              <ActiveProductPanel
                product={activeProduct}
                now={now}
                canBid={isJoined}
                bids={activeProductBids}
                onBid={handleBid}
              />
            )}
          </div>

          {/* Participants + chat */}
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
            <ParticipantList members={members} />
            <ChatPanel messages={chat} me={me} enabled={isJoined} onSend={handleSendMessage} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default AuctionRoomPage;