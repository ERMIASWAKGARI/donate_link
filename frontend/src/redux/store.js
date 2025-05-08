import { configureStore } from "@reduxjs/toolkit";
import needReducer from "./needSlice";
import notificationReducer from "./notificationSlice";
import donationReducer from "./donationsSlice"
export const store = configureStore({
  reducer: {
    needs: needReducer,
    notifications: notificationReducer,
    donation:donationReducer
    // ...other reducers
  },
});
