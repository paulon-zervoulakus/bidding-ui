import React, { useEffect, useState } from "react";
import connection, {
	invokeWithCookieCheck,
} from "../../../hooks/signalRService";
import * as signalR from "@microsoft/signalr";
import GetCookie from "../../../helper/account";

interface Message {
	user: string;
	message: string;
}

const HomeIndex: React.FC = () => {
	const [messages] = useState<Message[]>([]);
	// const [user, setUser] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const startConnection = async () => {
			if (connection.state === signalR.HubConnectionState.Disconnected) {
				try {
					await connection.start();
					console.log("SignalR Connected.");
				} catch (err) {
					console.error("SignalR Connection Error: ", err);
				}
			}
			0;
		};

		connection.onclose(async () => {
			console.log("SignalR Disconnected. Reconnecting...");
			await startConnection();
		});

		startConnection();

		return () => {
			if (connection.state !== signalR.HubConnectionState.Disconnected) {
				connection
					.stop()
					.catch((err) =>
						console.error("SignalR Disconnection Error: ", err)
					);
			}
		};
	}, []);

	const sendMessage = () => {
		if (connection.state === signalR.HubConnectionState.Connected) {
			invokeWithCookieCheck(connection, "SendMessage", message)
				.then(() => setMessage(""))
				.catch((err) => console.error("SignalR Send Error: ", err));
		} else {
			console.warn("SignalR is not connected..");
		}
	};

	connection.on("ReceiveMessage", (user: string, message: string) => {
		console.log(`${user}: ${message}`);
		// You can update the UI with the received message here
	});
	return (
		<main className="flex-grow-1">
			<div className="container">
				<h1>Welcome to My App</h1>
				<p>
					This is the main content area. Add your components and
					content here.
				</p>
				<div>
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Message"
					/>
					<button onClick={sendMessage}>Send</button>
					<ul>
						{messages.map((msg, index) => (
							<li key={index}>
								{msg.user}: {msg.message}
							</li>
						))}
					</ul>
				</div>
			</div>
		</main>
	);
};

export default HomeIndex;
