import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


// =========================
// SHADOW USER
// =========================

export const shadowUser = createAsyncThunk(
    "shadow/shadowUser",

    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `/api/v1/shadow/${userId}`,
                {},
                { withCredentials: true }
            );

            return {
                userId,
                data: res.data
            };

        } catch (error) {
            return rejectWithValue({
                userId,
                message:
                    error?.response?.data?.message ||
                    "Something went wrong"
            });
        }
    }
);


// =========================
// UNSHADOW USER
// =========================

export const unshadowUser = createAsyncThunk(
    "shadow/unshadowUser",

    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.delete(
                `/api/v1/shadow/${userId}`,
                { withCredentials: true }
            );

            return {
                userId,
                data: res.data
            };

        } catch (error) {
            return rejectWithValue({
                userId,
                message:
                    error?.response?.data?.message ||
                    "Something went wrong"
            });
        }
    }
);

// =========================
// GET SHADOWS OF A USER
// =========================

export const getShadows = createAsyncThunk(
    "shadow/getShadows",

    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/shadow/${userId}/shadows`,
                { withCredentials: true }
            );

            return {
                userId,
                data: res.data
            };

        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    }
);


// =========================
// GET SHADOWING OF A USER
// =========================

export const getShadowing = createAsyncThunk(
    "shadow/getShadowing",

    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/shadow/${userId}/shadowing`,
                { withCredentials: true }
            );

            return {
                userId,
                data: res.data
            };

        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    }
);


// =========================
// GET SHADOW STATUS
// =========================

export const getShadowStatus = createAsyncThunk(
    "shadow/getShadowStatus",

    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/shadow/${userId}/status`,
                { withCredentials: true }
            );

            return {
                userId,
                data: res.data
            };

        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    }
);

export const getMultipleShadowStatus = createAsyncThunk(
    "shadow/getMultipleShadowStatus",

    async (userIds, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "/api/v1/shadow/status/multiple",
                {
                    userIds
                },
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

    // Different users' shadows
    shadowsByUser: {},

    // Different users' shadowing
    shadowingByUser: {},

    // Shadow status of different users
    shadowStatusByUser: {},

    // Which user's button is processing
    loadingByUser: {},

    loading: false,

    error: null,

    success: false,

    message: null
};


const shadowSlice = createSlice({

    name: "shadow",

    initialState,

    reducers: {

        clearShadowError: (state) => {
            state.error = null;
        },

        clearShadowSuccess: (state) => {
            state.success = false;
            state.message = null;
        }

    },

    extraReducers: (builder) => {


        // =========================
        // SHADOW
        // =========================

        builder

            .addCase(shadowUser.pending, (state, action) => {

                const userId = action.meta.arg;

                state.loadingByUser[userId] = true;

                state.error = null;
            })

            .addCase(shadowUser.fulfilled, (state, action) => {

                const userId = action.payload.userId;

                state.loadingByUser[userId] = false;

                state.shadowStatusByUser[userId] = true;

                state.success = true;

                state.message =
                    action.payload.data.message;
            })

            .addCase(shadowUser.rejected, (state, action) => {

                const userId =
                    action.payload?.userId;

                if (userId) {
                    state.loadingByUser[userId] = false;
                }

                state.error =
                    action.payload?.message ||
                    "Something went wrong";
            });


        // =========================
        // UNSHADOW
        // =========================

        builder

            .addCase(unshadowUser.pending, (state, action) => {

                const userId = action.meta.arg;

                state.loadingByUser[userId] = true;

                state.error = null;
            })

            .addCase(unshadowUser.fulfilled, (state, action) => {

                const userId = action.payload.userId;

                state.loadingByUser[userId] = false;

                state.shadowStatusByUser[userId] = false;

                state.success = true;

                state.message =
                    action.payload.data.message;
            })

            .addCase(unshadowUser.rejected, (state, action) => {

                const userId =
                    action.payload?.userId;

                if (userId) {
                    state.loadingByUser[userId] = false;
                }

                state.error =
                    action.payload?.message ||
                    "Something went wrong";
            });

        // =========================
        // SHADOWS
        // =========================

        builder

            .addCase(getShadows.pending, (state) => {

                state.loading = true;

                state.error = null;
            })

            .addCase(getShadows.fulfilled, (state, action) => {

                state.loading = false;

                const userId =
                    action.payload.userId;

                state.shadowsByUser[userId] =
                    action.payload.data.data.users;
            })

            .addCase(getShadows.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload;
            });


        // =========================
        // SHADOWING
        // =========================

        builder

            .addCase(getShadowing.pending, (state) => {

                state.loading = true;

                state.error = null;
            })

            .addCase(getShadowing.fulfilled, (state, action) => {

                state.loading = false;

                const userId =
                    action.payload.userId;

                state.shadowingByUser[userId] =
                    action.payload.data.data.users;
            })

            .addCase(getShadowing.rejected, (state, action) => {

                state.loading = false;

                state.error = action.payload;
            });


        // =========================
        // SHADOW STATUS
        // =========================

        builder

            .addCase(getShadowStatus.pending, (state, action) => {

                const userId = action.meta.arg;

                state.loadingByUser[userId] = true;

                state.error = null;
            })

            .addCase(getShadowStatus.fulfilled, (state, action) => {

                const userId =
                    action.payload.userId;

                state.loadingByUser[userId] = false;

                state.shadowStatusByUser[userId] =
                    action.payload.data.data.isShadowing;
            })

            .addCase(getShadowStatus.rejected, (state, action) => {

                const userId =
                    action.meta.arg;

                state.loadingByUser[userId] = false;

                state.error = action.payload;
            });
        builder
            .addCase(
                getMultipleShadowStatus.pending,
                (state) => {

                    state.error = null;
                }
            )

            .addCase(
                getMultipleShadowStatus.fulfilled,
                (state, action) => {

                    const status =
                        action.payload.data.status;

                    state.shadowStatusByUser = {
                        ...state.shadowStatusByUser,
                        ...status
                    };
                }
            )

            .addCase(
                getMultipleShadowStatus.rejected,
                (state, action) => {

                    state.error = action.payload;
                }
            )
                

    }
});


export const {
    clearShadowError,
    clearShadowSuccess
} = shadowSlice.actions;


export default shadowSlice.reducer;