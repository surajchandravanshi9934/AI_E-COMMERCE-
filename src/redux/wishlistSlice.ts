import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface WishlistState {
    count: number;
    items: string[];
    fullProducts: any[];
    status: "idle" | "loading" | "succeeded" | "failed";
    fullFetchStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: WishlistState = {
    count: 0,
    items: [],
    fullProducts: [],
    status: "idle",
    fullFetchStatus: "idle",
};

export const fetchWishlistData = createAsyncThunk("wishlist/fetchWishlistData", async () => {
    const response = await axios.get("/api/wishlist/count");
    return response.data;
});

export const fetchFullWishlistData = createAsyncThunk("wishlist/fetchFullWishlistData", async () => {
    const response = await axios.get("/api/wishlist/get");
    return response.data;
});

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        setWishlistCount: (state, action) => {
            state.count = action.payload;
        },
        toggleWishlistItem: (state, action) => {
            const productId = action.payload;
            if (state.items.includes(productId)) {
                state.items = state.items.filter(id => id !== productId);
                state.fullProducts = state.fullProducts.filter(p => p._id !== productId);
                state.count = state.items.length;
            } else {
                state.items.push(productId);
                state.count = state.items.length;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlistData.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchWishlistData.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.count = action.payload.count;
                state.items = action.payload.wishlist.map((id: any) => id.toString());
            })
            .addCase(fetchWishlistData.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(fetchFullWishlistData.pending, (state) => {
                state.fullFetchStatus = "loading";
            })
            .addCase(fetchFullWishlistData.fulfilled, (state, action) => {
                state.fullFetchStatus = "succeeded";
                state.fullProducts = action.payload.products;
            })
            .addCase(fetchFullWishlistData.rejected, (state) => {
                state.fullFetchStatus = "failed";
            });
    },
});

export const { setWishlistCount, toggleWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
