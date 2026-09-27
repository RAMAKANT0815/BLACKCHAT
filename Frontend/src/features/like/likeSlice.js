import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Toggle Like
export const toggleLike = createAsyncThunk(
    "like/toggleLike",
    async (postId, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `/api/v1/like/${postId}`,
                {},
                {
                    withCredentials: true
                }
            );

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    }
);

// Get My Likes
export const getMyLikes = createAsyncThunk(
    "like/getMyLikes",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/v1/like/myLikes",
                {
                    withCredentials: true
                }
            );

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    }
);

const initialState = {
    likes: [],
    likesCount: 0,
    isLiked: false,
    loading: false,
    error: null,
    success: false
};

const likeSlice = createSlice({
    name: "like",

    initialState,

    reducers: {
        removeError: (state) => {
            state.error = null;
        },

        removeSuccess: (state) => {
            state.success = false;
        }
    },

    extraReducers: (builder) => {

        // Toggle Like
        builder
            .addCase(toggleLike.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(toggleLike.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                state.isLiked = action.payload.data.liked;
                state.likesCount = action.payload.data.likes;
            })
            .addCase(toggleLike.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        // Get My Likes
        builder
            .addCase(getMyLikes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyLikes.fulfilled, (state, action) => {
                state.loading = false;

                state.likes = action.payload.data.likes;
            })
            .addCase(getMyLikes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    removeError,
    removeSuccess
} = likeSlice.actions;

export default likeSlice.reducer;