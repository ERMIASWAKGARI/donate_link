import { configureStore } from "@reduxjs/toolkit";
import needReducer from "./needSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    needs: needReducer,
    notifications: notificationReducer,
    
    // ...other reducers
  },
});
