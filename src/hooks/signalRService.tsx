import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";
import { ConnectedUsersDTO, IncomingMessagesDTO } from "../dto/signalr";

const ClientConnection = new signalR.HubConnectionBuilder()
	.withUrl("http://localhost:5260/subastaHub", {
		accessTokenFactory: () => GetCookie("signalr_token") || "",
		withCredentials: true,
		transport:
			signalR.HttpTransportType.WebSockets ||
			signalR.HttpTransportType.LongPolling,
	})
	.configureLogging(signalR.LogLevel.Information)
	.build();

export const BroadcastReceiveMessage = (
	setIncomingMessages: React.Dispatch<React.SetStateAction<IncomingMessagesDTO[]>>
) => {
	ClientConnection.on(
		"ReceiveMessage",
		(user: string, message: string) => {
			setIncomingMessages(
				(prevIncomingMessages) => [
					...prevIncomingMessages,
					{ user, message },
				]
			);

		}
	);
}
export const BroadcastUpdateOnlineUserList = (
	setUsers: React.Dispatch<React.SetStateAction<ConnectedUsersDTO[]>>
) => {
	ClientConnection.on(
		"UpdateOnlineUsersList",
		(userList: ConnectedUsersDTO[]) => {
			setUsers(userList);
		}
	);
}
export const StartConnection = (
	setUsers: React.Dispatch<React.SetStateAction<ConnectedUsersDTO[]>>,
	setInputCtrl: React.Dispatch<React.SetStateAction<boolean>>,
	setIncomingMessages: React.Dispatch<React.SetStateAction<IncomingMessagesDTO[]>>
) => {
	if (ClientConnection.state === signalR.HubConnectionState.Disconnected) {
		ClientConnection
			.start()
			.then(() => {
				console.log("SignalR Connected..");
				setUsers([]);
				setInputCtrl(false);
				BroadcastReceiveMessage(setIncomingMessages);
				BroadcastUpdateOnlineUserList(setUsers);

			})
			.catch(() => {
				setInputCtrl(true);
				setTimeout(() => StartConnection(setUsers, setInputCtrl, setIncomingMessages), 1000);
			});
	}
	return;
}

export const BroadcastSendMessage = (
	message: string,
	setMessage: React.Dispatch<React.SetStateAction<string>>
): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (ClientConnection.state === signalR.HubConnectionState.Connected) {
			const token = GetCookie("signalr_token");

			if (token) {
				ClientConnection
					.invoke("SendMessage", message, token)
					.then(() => {
						setMessage("");
						return  resolve;
					})
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

function StopConnection(): void;
function StopConnection(
	setUsers: React.Dispatch<React.SetStateAction<ConnectedUsersDTO[]>>,
	setInputCtrl: React.Dispatch<React.SetStateAction<boolean>>
):void;
function StopConnection(
	setUsers?: React.Dispatch<React.SetStateAction<ConnectedUsersDTO[]>>,
	setInputCtrl?: React.Dispatch<React.SetStateAction<boolean>>
):void{
	if(ClientConnection.state !== signalR.HubConnectionState.Disconnected)
	{
		ClientConnection.stop().catch((err) =>
			console.error("Stopping the failed, Error: ", err)
		);
		if(setUsers) setUsers([]);
		if(setInputCtrl) setInputCtrl(true);
	}
}
export {StopConnection};