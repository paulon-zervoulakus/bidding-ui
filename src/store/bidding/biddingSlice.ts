import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuctionRoomDTO } from "../../dto/auctionRoom";

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

    updateAuctionRoom: (state, action: PayloadAction<AuctionRoomDTO>) => {
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if(index !== -1){
        state.rooms[index] = {...state.rooms[index], ...action.payload};
      }else{
        state.rooms.push(action.payload);
      }
    },
  },
});

export const { setAuctionRooms, updateAuctionRoom } = biddingSlice.actions;

export default biddingSlice.reducer;