import React, { useContext, useEffect, useState } from "react";
import RoomList from "./RoomList";
import CreateRoomForm from "./CreateRoomForm";
import { AuctionRoomDTO, RoomIndexDTO } from "../../../dto/auctionRoom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { GetAuctionRooms } from "../../../hooks/useAuctionRooms";
import { setAuctionRooms, updateAuctionRoom } from "../../../store/bidding/biddingSlice";
import {
	AcquireConnection,
	InvokeRegisterLobbyAuctionRoomList,
	InvokeUnregisterLobbyAuctionRoomList,
	ReleaseConnection,
	RegisterUpdateLobbyAuctionRoomDetails,
	// UnregisterUpdateLobbyAuctionRoom,
} from "../../../hooks/useSignalRServiceLobby";
import { UserContext } from "../../../context/userContextProvider";

interface FormPopupProps
{
	isOpen: boolean;
	isEditting: boolean;
	room?: AuctionRoomDTO | null;
}
const initFormPopup: FormPopupProps = {
	isOpen: false,
	isEditting: false,
	room: null
}
// Host/upgrade messaging lives in the sidebar (index.tsx); the create button lives in RoomList.
const AuctionRooms: React.FC = () => {
	const context = useContext(UserContext);
	const user = context?.user;
	const currentUserId = user?.id ?? 0;
	const [isPopupForm, setIsPopupForm] = useState<FormPopupProps>(initFormPopup);
	// const [incomingRoomUpdate, setIncomingRoomUpdate] = useState<Record<string, AuctionRoomDTO>>({});
	const dispatch = useDispatch<AppDispatch>();

	const { rooms } = useSelector(
		(state: RootState) => state.bidding
	)

	useEffect(() => {

		let cancelled = false;
		let existingRooms: RoomIndexDTO[] = [];
		// let publicRoomJoined: { id: number; groupName: string }[] = [];

		AcquireConnection().catch(console.error);

		GetAuctionRooms(async (data) => {
			if (cancelled) return;
			dispatch(setAuctionRooms(data));
			existingRooms = data.map((r) => ({
				roomId: r.id,
				groupName: r.groupName
			}));
			await RegisterUpdateLobbyAuctionRoomDetails((updatedRoom: AuctionRoomDTO) => {
				dispatch(updateAuctionRoom({room: updatedRoom, userId:currentUserId}));
			})
			await InvokeRegisterLobbyAuctionRoomList(existingRooms);
		});

		return () => {
			cancelled = true;
			InvokeUnregisterLobbyAuctionRoomList(existingRooms);
			// UnregisterUpdateLobbyAuctionRoom();
			ReleaseConnection();
		};
	}, [dispatch]);
	return (
		<div>
			<RoomList
				rooms={rooms}
				onCreate={() => setIsPopupForm({isOpen:true, isEditting:false})}
				onEdit={(room: AuctionRoomDTO) => setIsPopupForm({isOpen:true, isEditting:true, room: room})} />

			{isPopupForm.isOpen && (
				<CreateRoomForm
					room={isPopupForm?.room}
					onClose={() => setIsPopupForm(initFormPopup)}
					onSuccess={(room: AuctionRoomDTO) => {
						setIsPopupForm({isOpen:true, isEditting:false, room: room})
					}}
				/>
			)}

		</div>
	);
};

export default AuctionRooms;