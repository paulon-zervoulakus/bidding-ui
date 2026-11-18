import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../../../helper/auctionRoom";

export const ChatPanel: React.FC<{
  messages: ChatMessage[];
  me: string;
  enabled: boolean;
  onSend: (text: string) => Promise<void>;
}> = ({ messages, me, enabled, onSend }) => {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async () => {
    const value = text.trim();
    if (!value || !enabled) return;
    setText("");
    try {
      await onSend(value);
    } catch {
      setText(value); // give the text back so nothing is lost
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-base font-bold text-gray-900 mb-3">Room chat</h2>

      <div ref={listRef} className="h-72 overflow-y-auto rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.user === me;
            return (
              <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm break-words ${
                    mine ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {!mine && <p className="text-xs font-semibold text-indigo-600">{m.user}</p>}
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={!enabled}
          placeholder={enabled ? "Message the room" : "Connecting…"}
          className="min-w-0 flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
        />
        <button
          type="button"
          onClick={send}
          disabled={!enabled || !text.trim()}
          className="shrink-0 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </section>
  );
};