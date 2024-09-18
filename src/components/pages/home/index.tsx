import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import GetCookie from "../../../helper/account";
import connection from "../../../hooks/signalRService";

// const connection = new signalR.HubConnectionBuilder()
// 	.withUrl("http://localhost:5260/subastaHub", {
// 		accessTokenFactory: () => GetCookie("signalr_token") || "",
// 		transport:
// 			signalR.HttpTransportType.WebSockets ||
// 			signalR.HttpTransportType.LongPolling,
// 	})
// 	.configureLogging(signalR.LogLevel.Debug)
// 	.build();

const HomeIndex: React.FC = () => {
	const [users, setUsers] = useState<string[]>([]);
	const [incommingMessages, setIncommingMessages] = useState<
		{ user: string; message: string }[]
	>([]); // State for the list of messages
	const [message, setMessage] = useState("");
	const [inputCtrl, setInputCtrl] = useState(true);

	useEffect(() => {
		const startConnection = async () => {
			if (connection.state === signalR.HubConnectionState.Disconnected) {
				connection
					.start()
					.then(() => {
						console.log("SignalR Connected..");
						setInputCtrl(false);
						connection.on(
							"ReceiveMessage",
							(user: string, message: string) => {
								setIncommingMessages(
									(prevIncommingMessages) => [
										...prevIncommingMessages,
										{ user, message },
									]
								);
							}
						);

						connection.on(
							"UpdateOnlineUsersList",
							(userList: string[]) => {
								console.log(
									"UpdateOnlineUsersList: ",
									userList
								);
								setUsers(userList);
							}
						);
					})
					.catch((err) => {
						console.log("Stablishing connection failed: ", err);
						setInputCtrl(true);
						setTimeout(() => startConnection(), 5000);
					});
			}
			0;
		};

		connection.onclose(async () => {
			console.log("SignalR Disconnected. Reconnecting...");
			setInputCtrl(true);
			await startConnection();
		});

		startConnection();

		window.addEventListener("beforeunload", () => {
			if (connection.state === signalR.HubConnectionState.Connected) {
				connection
					.stop()
					.then(() => {
						console.log("SignalR connection stopped.");
					})
					.catch((err) => {
						console.error("Error stopping connection: ", err);
					});
			}
		});

		return () => {
			if (connection.state !== signalR.HubConnectionState.Disconnected) {
				connection
					.stop()
					.catch((err) =>
						console.error("SignalR Disconnection Error: ", err)
					);
				setInputCtrl(true);
				startConnection();
			}
		};
	}, []);

	const sendMessage = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (connection.state === signalR.HubConnectionState.Connected) {
				const token = GetCookie("signalr_token");
				if (token) {
					connection
						.invoke("SendMessage", message, token)
						.then(resolve)
						.catch((err) => {
							console.error("Error sending message: ", err);
							reject(new Error(err));
						});
				} else {
					reject(new Error("Missing token"));
				}
			} else {
				reject(new Error("SignalR token not available"));
			}
		});
	};

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
						disabled={inputCtrl}
					/>
					<button onClick={sendMessage} disabled={inputCtrl}>
						Send
					</button>
					<ul>
						{incommingMessages.map((msg, index) => (
							<li key={index}>
								{msg.user}: {msg.message}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2>Online Users</h2>
					<ul>
						{users.map((user, index) => (
							<li key={index}>{user}</li>
						))}
					</ul>
				</div>
			</div>
		</main>
	);
};

export default HomeIndex;
