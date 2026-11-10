import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/user/userSlice";
import biddingReducer from "../store/bidding/biddingSlice";

import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage
}
const rootReducer = combineReducers({
  user: userReducer,
  bidding: biddingReducer
});
const allReducer = persistReducer(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer:  allReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware ({
    serializableCheck: false
  })
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;