import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/user/userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage
}
const persistUserReducer = persistReducer(
  persistConfig,
  userReducer
)
export const store = configureStore({
  reducer:  {
    user: persistUserReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware ({
    serializableCheck: false
  })
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;