import { AuctionRoomDTO } from "../../../dto/auctionRoom";

export const RoomHeaderCard: React.FC<{
  room: AuctionRoomDTO;
  onlineCount: number;
  onLeave: () => void;
}> = ({ room, onlineCount, onLeave }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Auction room
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          {room.title}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{room.groupName}</p>
        {room.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{room.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onLeave}
        className="shrink-0 w-full sm:w-auto px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Leave room
      </button>
    </div>

    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      <div className="rounded-lg bg-gray-50 p-3 min-w-0">
        <dt className="text-xs text-gray-500">Host</dt>
        <dd className="font-semibold text-gray-900 truncate">
          {room.hostUserName || "—"}
        </dd>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <dt className="text-xs text-gray-500">Members</dt>
        <dd className="font-semibold text-gray-900">{room.memberCount ?? 0}</dd>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <dt className="text-xs text-gray-500">Online now</dt>
        <dd className="font-semibold text-gray-900">{onlineCount}</dd>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <dt className="text-xs text-gray-500">Products</dt>
        <dd className="font-semibold text-gray-900">{room.roomProducts?.length ?? 0}</dd>
      </div>
    </dl>
  </section>
);