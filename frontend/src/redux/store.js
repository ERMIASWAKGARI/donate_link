import { configureStore } from "@reduxjs/toolkit";
import needReducer from "./needSlice";
import notificationReducer from "./notificationSlice";
import donationsReducer from "./donationsSlice"
export const store = configureStore({
  reducer: {
    needs: needReducer,
    notifications: notificationReducer,
    donations: donationsReducer,
    // ...other reducers
  },
});
