import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import vendorSlice from "./vendorSlice"
import orderSlice from "./orderSlice"
import cartSlice from "./cartSlice"
export const store = configureStore({
    reducer: {
        user: userSlice,
        vendor: vendorSlice,
        order: orderSlice,
        cart: cartSlice
    }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch