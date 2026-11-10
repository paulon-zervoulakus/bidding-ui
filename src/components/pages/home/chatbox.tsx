import { useEffect, useState } from "react";
import  {
	StartConnection as SignalRStartConnection,
	StopConnection as SignalRStopConnection,
	BroadcastSendMessage
} from "../../../hooks/signalRService";
import {ConnectedUsersDTO, IncomingMessagesDTO } from "../../../dto/signalr";

const Chatbox: React.FC = () => {

	const [users, setUsers] = useState<ConnectedUsersDTO[]>([]);
	const [incomingMessages, setIncomingMessages] = useState<
		IncomingMessagesDTO[]
	>([]);
	const [message, setMessage] = useState("");
	const [inputCtrl, setInputCtrl] = useState(true);

	useEffect(() => {
		const container = document.getElementById('incomingMessages');
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}, [incomingMessages]);

	useEffect(() => {
		SignalRStartConnection(setUsers, setInputCtrl, setIncomingMessages);

		window.addEventListener("beforeunload",	() => SignalRStopConnection(setUsers, setInputCtrl));

		return () => {
			SignalRStopConnection(setUsers, setInputCtrl);
		};
	}, []);

	const sendMessage = async () => {
		await BroadcastSendMessage(message, setMessage);
	}

	return (
		<div className="flex flex-col md:flex-row gap-4 md:h-80">
			{/* Column 1: users */}
			<ul className="md:w-56 md:shrink-0 max-h-40 md:max-h-none overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
				{users.map((user, index) => (
					<li key={index} className="flex items-center gap-2 px-3 py-2 min-w-0">
						{user.avatarSrc ? (
							<img
								src={user.avatarSrc}
								alt=""
								className="w-7 h-7 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="w-7 h-7 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">
								{(user.fullname || "?").charAt(0).toUpperCase()}
							</div>
						)}
						<span className="text-sm text-gray-900 truncate">{user.fullname}</span>
					</li>
				))}
			</ul>

			{/* Column 2: messages + input */}
			<div className="flex flex-col flex-1 min-w-0 gap-2">
				<div
					id="incomingMessages"
					className="h-56 md:h-auto md:flex-1 overflow-y-auto rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5"
				>
					{incomingMessages.map((msg, index) => (
						<div
							key={index}
							className="w-fit max-w-full bg-blue-100 text-blue-900 text-sm px-2.5 py-1 rounded-lg break-words"
						>
							<span className="font-semibold">{msg.user}:</span> {msg.message}
						</div>
					))}
				</div>
				<div className="flex gap-2">
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Message"
						disabled={inputCtrl}
						className="min-w-0 flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								sendMessage();
							}
						}}
					/>
					<button
						onClick={sendMessage}
						disabled={inputCtrl}
						className="shrink-0 bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	)
}
export default Chatbox;