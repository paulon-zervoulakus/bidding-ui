import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";
import { BidDTO, ConnectedUsersDTO, IncomingMessagesDTO } from "../dto/signalr";
import { AuctionRoomDTO } from "../dto/auctionRoom";
import { AppDispatch } from "../store/store";
import { updateAuctionRoom } from "../store/bidding/biddingSlice";

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

// ---------------------------------------------------------------------------
// Handlers: .off() first so re-registering never stacks duplicate handlers
// ---------------------------------------------------------------------------
export const BroadcastReceiveMessage = (
	setIncomingMessages: React.Dispatch<React.SetStateAction<IncomingMessagesDTO[]>>
) => {
	ClientConnection.off("ReceiveMessage");
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
	ClientConnection.off("UpdateOnlineUsersList");
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
	retain();
	const connect = () => {
		EnsureConnection()
			.then(() => {
				console.log("SignalR Connected..");
				setUsers([]);
				setInputCtrl(false);
				BroadcastReceiveMessage(setIncomingMessages);
				BroadcastUpdateOnlineUserList(setUsers);
			})
			.catch(() => {
				setInputCtrl(true);
				// stop retrying once nothing needs the connection any more
				if (consumers > 0) setTimeout(connect, 1000);
			});
	};
	connect();
}
export const ReceiveAuctionRoomMessage = (
	dispatch: AppDispatch
) => {
	// ClientConnection.off("UpdateAuctionRoom");
	ClientConnection.on(
		"UpdateAuctionRoom",
		(message: AuctionRoomDTO) => dispatch(updateAuctionRoom(message))
	);
};
export const StopReceivingAuctionRoomMessage = () => {
	ClientConnection.off("UpdateAuctionRoom");
};
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


export const JoinAuctionRoom = async (
	roomId: Number,
	groupName: string
): Promise<void> => {
	try {
		await EnsureConnection();
		await ClientConnection.invoke("JoinRoom", roomId, groupName);
		console.log(`Joined room: ${roomId}-${groupName}`);
	} catch (err) {
		console.error("Error joining room: ", err);
		throw new Error(String(err));
	}
};

export const LeaveAuctionRoom = async (
	roomId: Number,
	groupName: string
): Promise<void> => {
	// Groups die with the connection, so there is nothing to leave if we're not connected
	if (ClientConnection.state !== signalR.HubConnectionState.Connected) return;
	try {
		await ClientConnection.invoke("LeaveRoom", roomId, groupName);
		console.log(`Left room: ${groupName}`);
	} catch (err) {
		console.error("Error leaving room: ", err);
		throw new Error(String(err));
	}
};

export const SendBid = (
	groupName: string,
	amount: number,
	bidderName: string
): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (ClientConnection.state === signalR.HubConnectionState.Connected) {
			ClientConnection
				.invoke("SendBid", groupName, amount, bidderName)
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

export const BroadcastReceiveBid = (
  onBidsReceived: (newBids: BidDTO[]) => void
) => {
  ClientConnection.off("ReceiveBid");
  ClientConnection.on(
    "ReceiveBid",
    (bidder: string, amount: number) => {
      const newBid: BidDTO = {
        bidder,
        amount,
        timestamp: new Date().toISOString()
      };

      onBidsReceived([newBid]);
    }
  );
};

export const BroadcastUserJoinedRoom = (
	setMembers: React.Dispatch<React.SetStateAction<string[]>>
) => {
	ClientConnection.off("UserJoinedRoom");
	ClientConnection.on("UserJoinedRoom", (connectionId: string, groupName: string) => {
		setMembers((prevMembers) => [...prevMembers, connectionId]);
		console.log("User Joined a Room: " + groupName)
	});
};

export const BroadcastUserLeftRoom = (
	setMembers: React.Dispatch<React.SetStateAction<string[]>>
) => {
	ClientConnection.off("UserLeftRoom");
	ClientConnection.on("UserLeftRoom", (connectionId: string, groupName: string) => {
		setMembers((prevMembers) => prevMembers.filter((m) => m !== connectionId));
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