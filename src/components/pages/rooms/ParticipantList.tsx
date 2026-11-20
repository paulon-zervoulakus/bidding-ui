import { RoomMember } from "../../../dto/auctionRoom";

export const ParticipantList: React.FC<{ members: RoomMember[] }> = ({ members }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-gray-900">Participants</h2>
      <span className="text-xs text-gray-500">{members.length} online</span>
    </div>

    {members.length === 0 ? (
      <p className="text-sm text-gray-400">No participants yet</p>
    ) : (
      <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100">
        {members.map((m) => (
          <li key={m.userId} className="flex items-center gap-2 py-2 min-w-0">
            <span className="w-7 h-7 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">
              {(m.fullname || "?").charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-gray-800 truncate">{m.fullname}</span>
            <span className="ml-auto w-2 h-2 shrink-0 rounded-full bg-green-500" />
          </li>
        ))}
      </ul>
    )}
  </section>
);