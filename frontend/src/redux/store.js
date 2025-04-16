import { configureStore } from "@reduxjs/toolkit";
import needReducer from "./needSlice";

export const store = configureStore({
  reducer: {
    needs: needReducer,
    
    // ...other reducers
  },
});
