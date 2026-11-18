import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";
import { BidDTO, ConnectedUserDTO, IncomingMessagesDTO, RoomMember } from "../dto/signalr";
import { AuctionRoomDTO } from "../dto/auctionRoom";
import { AppDispatch } from "../store/store";
import { updateAuctionRoom } from "../store/bidding/biddingSlice";
import React, { SetStateAction } from "react";

const ClientConnection = new signalR.HubConnectionBuilder()
	.withUrl(__API_URL__ + "/subastaHub", {
		accessTokenFactory: () => GetCookie("signalr_token") || "",
		withCredentials: true,
		// bitwise OR enables both with fallback ("||" always picked WebSockets only)
		transport:
			signalR.HttpTransportType.WebSockets |
			signalR.HttpTransportType.LongPolling,
	})
	.withAutomaticReconnect()
	.configureLogging(signalR.LogLevel.Information)
	.build();

// ---------------------------------------------------------------------------
// Connection lifecycle: one shared connection, started once, stopped only when
// the last component using it is gone (deferred, so StrictMode's
// mount -> cleanup -> mount doesn't kill it).
// ---------------------------------------------------------------------------
let startPromise: Promise<void> | null = null;
let consumers = 0;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

export const EnsureConnection = async (): Promise<void> => {
	const S = signalR.HubConnectionState;
	for (;;) {
		if (ClientConnection.state === S.Connected) return;
		if (ClientConnection.state === S.Disconnected) {
			startPromise ??= ClientConnection.start().finally(() => {
				startPromise = null;
			});
			return startPromise;
		}
		if (startPromise) return startPromise;
		// Disconnecting / Reconnecting: wait and re-check
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
};

const retain = () => {
	consumers++;
	if (stopTimer) {
		clearTimeout(stopTimer);
		stopTimer = null;
	}
};

// Use in components that need the connection: Acquire on mount, Release on unmount
export const AcquireConnection = (): Promise<void> => {
	retain();
	return EnsureConnection();
};

export const ReleaseConnection = (): void => {
	consumers = Math.max(0, consumers - 1);
	if (consumers === 0 && !stopTimer) {
		stopTimer = setTimeout(() => {
			stopTimer = null;
			if (consumers === 0) StopConnection();
		}, 1000);
	}
};

export const BroadcastReceiveLobbyMessage = async (
	setIncomingMessages: React.Dispatch<React.SetStateAction<IncomingMessagesDTO[]>>
) => {
	ClientConnection.off("ReceiveLobbyMessage");
	ClientConnection.on(
		"ReceiveLobbyMessage",
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
	setUsers: React.Dispatch<React.SetStateAction<ConnectedUserDTO[]>>
) => {
	ClientConnection.on(
		"UpdateOnlineUsersList",
		(userList: any[]) => {
			setUsers(userList);
		}
	);
}
export const StartConnection = (
	setInputCtrl: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	retain();
	const connect = () => {
		EnsureConnection()
			.then(() => {
				console.log("SignalR Connected..");
				setInputCtrl(false);

			})
			.catch(() => {
				setInputCtrl(true);
				// stop retrying once nothing needs the connection any more
				if (consumers > 0) setTimeout(connect, 1000);
			});
	};
	connect();
}
export const LeaveAuctionRoom = async (
	roomId: number,
	groupName: string
): Promise<void> => {
	// Groups die with the connection, so there is nothing to leave if we're not connected
	if (ClientConnection.state !== signalR.HubConnectionState.Connected) return;
	try {
		await ClientConnection.invoke("LeaveAuctionRoom", roomId, groupName);
		console.log(`Left: room-${roomId}-${groupName}`);
	} catch (err) {
		console.error("Error leaving room: ", err);
		throw new Error(String(err));
	}
};
export const JoinAuctionRoom = async (
	roomId: number,
	groupName: string
): Promise<void> => {
	try {
		await EnsureConnection();
		await ClientConnection.invoke("JoinAuctionRoom", roomId, groupName);
		console.log(`Joined: room-${roomId}-${groupName}`);
	} catch (err) {
		console.error("Error joining room: ", err);
		throw new Error(String(err));
	}
};

export const SendRoomMessage = (groupName: string, message: string): Promise<void> =>
  ClientConnection.invoke("SendRoomMessage", groupName, message);

export const BroadcastReceiveRoomMessage = (onMessage: (m: { user: string; message: string }) => void) => {
  ClientConnection.off("ReceiveRoomMessage");
  ClientConnection.on("ReceiveRoomMessage", (user: string, message: string) => onMessage({ user, message }));
};

export const SendBid = (
	groupName: string,
	roomProductId: number,
	amount: number,
): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (ClientConnection.state === signalR.HubConnectionState.Connected) {
			ClientConnection
				.invoke("SendBid", groupName, roomProductId, amount)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error("Error sending bid: ", err);
					reject(new Error(err));
				});
		} else {
			reject(new Error("SignalR connection not available"));
		}
	});
};

export const BroadcastReceiveProductBid = (
	onBidsReceived: (newBids: BidDTO[]
) => void) => {
  ClientConnection.off("ReceiveBid");
  ClientConnection.on("ReceiveBid", (roomId: number, roomProductId: number, bidder: string, amount: number) => {
    onBidsReceived([{ roomId, roomProductId, bidder, amount, timestamp: new Date().toISOString() }]);
  });
};

export const BroadcastUserJoinedRoom = (
	setMembers: React.Dispatch<SetStateAction<RoomMember[]>>
) => {
	ClientConnection.off("UserJoinedRoom");
	ClientConnection.on(
		"UserJoinedRoom",
		(connectionId: string, groupName: string, user: ConnectedUserDTO) => {
			console.log(groupName, user);
			setMembers((prev) =>
				prev.some((m) => m.connectionId === connectionId)
					? prev                                  // no duplicates after a reconnect
					: [...prev, { ...user, connectionId, groupName }]
			);
		}
	);
};

export const BroadcastUserLeftRoom = (
	setMembers: React.Dispatch<React.SetStateAction<RoomMember[]>>
) => {
	ClientConnection.off("UserLeftRoom");
	ClientConnection.on("UserLeftRoom", (connectionId: string, groupName: string, user: ConnectedUserDTO) => {
		setMembers((prev) =>
			prev.filter((m) => m.connectionId !== connectionId && m.groupName !== groupName));
	});
};

/*****	Lobby */
export const SendLobbyMessage = (
	message: string,
	setMessage: React.Dispatch<React.SetStateAction<string>>
): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (ClientConnection.state === signalR.HubConnectionState.Connected) {
			const token = GetCookie("signalr_token");
			if (token) {
				ClientConnection
					.invoke("SendLobbyMessage", message, token)
					.then(() => {
						setMessage("");
						resolve();
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
/**
 * Receives update for Lobby Auction Rooms
 * @param dispatch
 * @param currentUserId
 */
export const BroadcastLobbyAuctionRoomMessage = (
	dispatch: AppDispatch,
	currentUserId: number
) => {
	ClientConnection.off("UpdateLobbyAuctionRoom");
	ClientConnection.on(
		"UpdateLobbyAuctionRoom",
		(dto: AuctionRoomDTO) => {
			dispatch(updateAuctionRoom({room:dto, userId: currentUserId}));
		}
	);
};
export const StopBroadcastLobbyAuctionRoomMessage = () => {
	ClientConnection.off("UpdateLobbyAuctionRoom");
};
/**
 * Connect to Lobby Auction Room
 * @param roomId
 * @param groupName
 */
export const JoinLobbyAuctionRoom = async (
	roomId: number,
	groupName: string
): Promise<void> => {
	try {
		await EnsureConnection();
		await ClientConnection.invoke("JoinLobbyAuctionRoom", roomId, groupName);
		console.log(`Joined room: ${roomId}-${groupName}`);
	} catch (err) {
		console.error("Error joining room: ", err);
		throw new Error(String(err));
	}
};
/**
 * Disconnect to Lobby Auction Room
 * @param roomId
 * @param groupName
 * @returns
 */
export const LeaveLobbyAuctionRoom = async (
	roomId: number,
	groupName: string
): Promise<void> => {
	// Groups die with the connection, so there is nothing to leave if we're not connected
	if (ClientConnection.state !== signalR.HubConnectionState.Connected) return;
	try {
		await ClientConnection.invoke("LeaveLobbyAuctionRoom", roomId, groupName);
		console.log(`Left room: ${groupName}`);
	} catch (err) {
		console.error("Error leaving room: ", err);
		throw new Error(String(err));
	}
};


/**
 * Override StopConnection
 */
function StopConnection(): void;
function StopConnection(
	setUsers: React.Dispatch<React.SetStateAction<ConnectedUserDTO[]>>,
	setInputCtrl: React.Dispatch<React.SetStateAction<boolean>>
):void;
function StopConnection(
	setUsers?: React.Dispatch<React.SetStateAction<ConnectedUserDTO[]>>,
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