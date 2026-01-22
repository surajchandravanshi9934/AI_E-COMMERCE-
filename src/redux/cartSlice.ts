import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCartCount = createAsyncThunk("cart/fetchCount", async () => {
    try {
        const res = await axios.get("/api/cart/get");
        if (res.status === 200) {
            const cart = res.data?.cart || [];
            const totalQty = cart.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
            );
            return totalQty;
        }
    } catch (err) {
        console.log("Cart fetch error:", err);
    }
    return 0;
});

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        count: 0,
    },
    reducers: {
        updateCartCount: (state, action) => {
            state.count = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCartCount.fulfilled, (state, action) => {
            state.count = action.payload;
        });
    },
});

export const { updateCartCount } = cartSlice.actions;
export default cartSlice.reducer;
