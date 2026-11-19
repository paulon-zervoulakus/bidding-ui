import * as signalR from "@microsoft/signalr";
import GetCookie from "../helper/account";
import { SetStateAction } from "react";
import { RoomIndexDTO, ConnectedUserDTO, RoomMember, OutgoingAuctionBidDTO, AuctionBidDTO, IncomingAuctionBidDTO } from "../dto/auctionRoom";

const ClientConnection = new signalR.HubConnectionBuilder()
  .withUrl(__API_URL__ + "/subastaHub/room", {
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
// const ReleaseConnection = (): void => {
//   consumers = Math.max(0, consumers - 1);
//   if (consumers === 0 && !stopTimer) {
//     stopTimer = setTimeout(() => {
//       stopTimer = null;
//       if (consumers === 0) StopConnection();
//     }, 1000);
//   }
// };
// const AcquireConnection = (): Promise<void> => {
//   retain();
//   return EnsureConnection();
// };

//=============   Received  ==================

/**
 *
 * @param onBidsReceived
 */
const RegisterReceiveAuctionBid = (
  onBidsReceived: (updatedRoom: AuctionBidDTO) => void
) => {
  ClientConnection.off("ReceiveAuctionBid");
  ClientConnection.on("ReceiveAuctionBid", (
    dto: AuctionBidDTO
  ) => {
    onBidsReceived({
      ...dto,
      timestamp: dto.timestamp ?? new Date().toISOString()
    });
  });
};
const RegisterUserJoinedRoom = (
  setMembers: React.Dispatch<SetStateAction<RoomMember[]>>
) => {
  ClientConnection.off("UpdateRoomOnlineUsersList");
  ClientConnection.on(
    "UpdateRoomOnlineUsersList",
    (members: RoomMember[]) => {
      setMembers( members );
    }
  );
};
// const RegisterUserLeftRoom = (
//   setMembers: React.Dispatch<React.SetStateAction<RoomMember[]>>
// ) => {
//   ClientConnection.off("UserLeftRoom");
//   ClientConnection.on("UserLeftRoom", (connectionId: string, groupName: string, user: ConnectedUserDTO) => {
//     setMembers((prev) =>
//       prev.filter((m) => m.connectionId !== connectionId && m.groupName !== groupName));
//   });
// };
const RegisterReceiveRoomMessage = (
  onMessage: ( user: string, message: string ) => void
) => {
  ClientConnection.off("ReceiveRoomMessage");
  ClientConnection.on("ReceiveRoomMessage", (user: string, message: string) =>
    onMessage(user, message ));
};
const InvokeSendProductBid = (
  dto: OutgoingAuctionBidDTO
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (ClientConnection.state === signalR.HubConnectionState.Connected) {
      ClientConnection
        .invoke("SendProductBid", dto )
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
const InvokeSendRoomMessage = (roomId: number, groupName: string, message: string): Promise<void> =>
{
  return new Promise((resolve, reject) => {
    if (ClientConnection.state === signalR.HubConnectionState.Connected) {
      ClientConnection
        .invoke("SendRoomMessage", roomId, groupName, message)
        .then(() => resolve())
        .catch((err) => {
          console.log("Error sending message: ", err);
          reject(new Error(err));
        });
      } else {
        reject( new Error("SignalR connection not available"));
      }
  });
}

const InvokeJoinAuctionRoom = async (
  room: RoomIndexDTO
): Promise<void> => {
  try {
    await EnsureConnection();
    await ClientConnection.invoke("JoinAuctionRoom", room);
  } catch (err) {
    console.error("Error joining room: ", err);
    throw new Error(String(err));
  }
};

/**
 * List of roomIds to Unregister from Lobby Auction Room
 * @param roomIds
 * @param groupName
 * @returns
 */
const InvokeLeaveAuctionRoom = async (
  room: RoomIndexDTO
): Promise<void> => {
  // Groups die with the connection, so there is nothing to leave if we're not connected
  if (ClientConnection.state !== signalR.HubConnectionState.Connected) return;
  try {
    await ClientConnection.invoke("LeaveAuctionRoom", room);
  } catch (err) {
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

const StartConnection = () => {
  retain();
  const connect = () => {
    EnsureConnection()
      .then(() => {

      })
      .catch(() => {
        // stop retrying once nothing needs the connection any more
        if (consumers > 0) setTimeout(connect, 1000);
      });
  };
  connect();
}

export {
  StartConnection,
  StopConnection,
  EnsureConnection,
  // Invoke
  InvokeSendProductBid,
  InvokeSendRoomMessage,
  InvokeJoinAuctionRoom,
  InvokeLeaveAuctionRoom,
  // Broadcast
  RegisterReceiveAuctionBid,
  RegisterUserJoinedRoom,
  // RegisterUserLeftRoom,
  RegisterReceiveRoomMessage,
};