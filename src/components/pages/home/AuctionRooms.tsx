import React, { useEffect, useState } from "react";
import RoomList from "./RoomList";
import CreateRoomForm from "./CreateRoomForm";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { GetAuctionRooms, GetManageAuctionRooms } from "../../../hooks/useAuctionRooms";
import { setAuctionRooms } from "../../../store/bidding/biddingSlice";
import { AcquireConnection, JoinAuctionRoom, LeaveAuctionRoom, ReceiveAuctionRoomMessage, ReleaseConnection, StopReceivingAuctionRoomMessage } from "../../../hooks/signalRService";

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
	const [isPopupForm, setIsPopupForm] = useState<FormPopupProps>(initFormPopup);
	// const [incomingRoomUpdate, setIncomingRoomUpdate] = useState<Record<string, AuctionRoomDTO>>({});
	const dispatch = useDispatch<AppDispatch>();

		const { rooms } = useSelector(
			(state: RootState) => state.bidding
		)

		useEffect(() => {
			let cancelled = false;
			let joined: { id: number; groupName: string }[] = [];

			AcquireConnection().catch(console.error);
			ReceiveAuctionRoomMessage(dispatch); // register immediately, not after the fetch

			GetManageAuctionRooms(async (data) => {
				if (cancelled) return;
				dispatch(setAuctionRooms(data));
				joined = data.map((r) => ({ id: r.id, groupName: r.groupName }));
				await Promise.allSettled(data.map((r) => JoinAuctionRoom(r.id, r.groupName)));
			});

			return () => {
				cancelled = true;
				StopReceivingAuctionRoomMessage();
				joined.forEach((r) => LeaveAuctionRoom(r.id, r.groupName).catch(() => {}));
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