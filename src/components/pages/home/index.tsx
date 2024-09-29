import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import GetCookie from "../../../helper/account";
import connection from "../../../hooks/signalRService";
import ProductList from "./productList";

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
		<main className="flex justify-center">
			<div className="w-full mt-5">
				<h1 className="text-3xl">Welcome to Lobby</h1>
				<p>
					This is the main content area. Add your components and
					content here.
				</p>
				<div className="bg-gray-200 flex flex-1 container p-6 space-x-4" aria-placeholder="Thumbnails">
					<ProductList />
				</div>
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



				<div className="flex flex-1 container mx-auto p-6 space-x-4">


					{/* Logged-in Users Sidebar */}
					{/* <aside className="w-64 bg-white p-4 rounded-lg shadow-md">
						<h2 className="text-lg font-bold mb-4">Logged-in Users</h2>
						<ul className="space-y-3">
							{users.map((user) => (
							<li key={user.id} className="flex items-center space-x-3">
								<img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
								<span className="text-gray-700">{user.name}</span>
							</li>
							))}
						</ul>
					</aside> */}
				</div>
			</div>
		</main>
	);
};

export default HomeIndex;
