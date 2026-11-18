import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuctionRoomDTO } from "../../dto/auctionRoom";
import { RoomVisibilityEnum } from "../../dto/common";

interface Bidding {
  rooms: AuctionRoomDTO[]
}
const initialState: Bidding = {
  rooms: []
};

const biddingSlice = createSlice({
  name: "auctionRoom",
  initialState,
  reducers: {
    setAuctionRooms: (state, action: PayloadAction<AuctionRoomDTO[]>) => {
      state.rooms = action.payload;
    },
    updateAuctionRoom: (state, action: PayloadAction<{room: AuctionRoomDTO, userId?: number}>) => {
      const { room, userId } = action.payload;
      const index = state.rooms.findIndex((r) => r.id === room.id);

      const isNotHost = userId !== undefined && room.hostId !== userId;
      // TODO: replace 'isPrivate' with your actual visibility field (e.g. room.visibility === 'private')
      const isPrivate = (room as any).visibility == RoomVisibilityEnum.private ? true : false;

       if (index !== -1) {
        // Room already in state
        if (isNotHost && isPrivate) {
          // Not the host and room just became private → remove from list
          state.rooms.splice(index, 1);
        } else {
          state.rooms[index] = { ...state.rooms[index], ...room };
        }
      } else {
        // Room not in state yet
        if (!(isNotHost && isPrivate)) {
          state.rooms.push(room);
        }
        // else: skip adding (hidden from this user)
      }
    },
  },
});

export const {
  setAuctionRooms, updateAuctionRoom,
} = biddingSlice.actions;

export default biddingSlice.reducer;