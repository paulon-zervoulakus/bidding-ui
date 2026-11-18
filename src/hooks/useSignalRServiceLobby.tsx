import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";
import { AuctionRoomDTO, RoomIndexDTO, ConnectedUserDTO, IncomingMessagesDTO  } from "../dto/auctionRoom";

const ClientConnection = new signalR.HubConnectionBuilder()
	.withUrl(__API_URL__ + "/subastaHub/lobby", {
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

let startPromise: Promise<void> | null = null;
let consumers = 0;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

const EnsureConnection = async (): Promise<void> => {
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

const AcquireConnection = (): Promise<void> => {
  retain();
  return EnsureConnection();
};

const ReleaseConnection = (): void => {
  consumers = Math.max(0, consumers - 1);
  if (consumers === 0 && !stopTimer) {
    stopTimer = setTimeout(() => {
      stopTimer = null;
      if (consumers === 0) StopConnection();
    }, 1000);
  }
};

const StartConnection = (
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
//========================  Invoke

const InvokeSendLobbyMessage = (
  message: string,
  onError?: (errMessage: string) => void
): Promise<void> =>
{
	return new Promise((resolve, reject) => {
		if (ClientConnection.state === signalR.HubConnectionState.Connected) {
				ClientConnection
					.invoke("SendLobbyMessage", message)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						console.error("Error sending message: ", err);
            onError?.(`Error sending message: ${err}`)
						reject(new Error(err));
					});
		} else {
      onError?.("SignalR token expired");
			reject(new Error("SignalR token not available"));
		}
	});
};

/**
 * List of roomIds to Register from Lobby Auction Room
 * @param roomIds
 * @param groupName
 */
const InvokeRegisterLobbyAuctionRoomList = async (
  rooms: RoomIndexDTO[]
): Promise<void> => {
  try {
    await EnsureConnection();
    await ClientConnection.invoke("RegisterLobbyAuctionRoomList", rooms);
  } catch (err) {
    throw new Error(String(err));
  }
};

/**
 * List of roomIds to Unregister from Lobby Auction Room
 * @param roomIds
 * @param groupName
 * @returns
 */
const InvokeUnregisterLobbyAuctionRoomList = async (
  rooms: RoomIndexDTO[]
): Promise<void> => {
  // Groups die with the connection, so there is nothing to leave if we're not connected
  if (ClientConnection.state !== signalR.HubConnectionState.Connected) return;
  try {
    await ClientConnection.invoke("UnregisterLobbyAuctionRoomList", rooms);
  } catch (err) {
    throw new Error(String(err));
  }
};

//========================  Invoke

/**
 * Receives update for Lobby Auction Rooms
 * @param dispatch
 * @param currentUserId
 */
const RegisterUpdateLobbyMessage = async (
  onUpdateLobbyMessage?: (dto: IncomingMessagesDTO) => void
) => {
  ClientConnection.off("UpdateLobbyMessage");
  ClientConnection.on(
    "UpdateLobbyMessage",
    (user: string, message: string) => {
      onUpdateLobbyMessage?.({user, message});
    }
  );
};
const UnregisterUpdateLobbyMessage = () => {
  ClientConnection.off("UpdateLobbyMessage");
};

const RegisterUpdateLobbyAuctionRoomDetails = async (
  onRegisterUpdateLobbyAuctionRoom?: (room: AuctionRoomDTO) => void
) => {
  ClientConnection.off("UpdateLobbyAuctionRoomDetails");
  ClientConnection.on(
    "UpdateLobbyAuctionRoomDetails",
    (room: AuctionRoomDTO) => {
      console.table(room)
      onRegisterUpdateLobbyAuctionRoom?.(room);
    }
  );
}
const UnregisterUpdateLobbyAuctionRoomDetails = async () =>
  ClientConnection.off("UpdateLobbyAuctionRoomDetails");

const RegisterUpdateLobbyOnlineUserList = (
  setUsers: React.Dispatch<React.SetStateAction<ConnectedUserDTO[]>>
) => {
  ClientConnection.on(
    "UpdateLobbyOnlineUsersList",
    (userList: any[]) => {
      setUsers(userList);
    }
  );
}

export {
  StopConnection,
  StartConnection,
  AcquireConnection,
  EnsureConnection,
  ReleaseConnection,
  //===== Invoke
  InvokeSendLobbyMessage,
  InvokeRegisterLobbyAuctionRoomList,
  InvokeUnregisterLobbyAuctionRoomList,
  //===== Broadcast
  RegisterUpdateLobbyMessage,
  UnregisterUpdateLobbyMessage,
  RegisterUpdateLobbyAuctionRoomDetails,
  UnregisterUpdateLobbyAuctionRoomDetails,
  RegisterUpdateLobbyOnlineUserList
};