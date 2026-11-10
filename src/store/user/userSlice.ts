import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BasicProfileDTO } from "../../dto/account";

interface User {
  profile: BasicProfileDTO | null,
  isAuthenticated: boolean
}
const initialState: User = {
  profile: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<BasicProfileDTO>) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },

    updateUserName: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.userName = action.payload;
      }
    },

    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUserName, logout } = userSlice.actions;

export default userSlice.reducer;