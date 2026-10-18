import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Send a private message
export const sendPrivateMessage = createAsyncThunk(
    "chat/sendPrivateMessage",
    async ({ userId, message }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(
                `/api/v1/conversation/personal/send/${userId}`,
                { message },
                { withCredentials: true }
            );

            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to send message"
            );
        }
    }
);

// Fetch private chat history
export const getPrivateMessages = createAsyncThunk(
    "chat/getPrivateMessages",
    async (userId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(
                `/api/v1/conversation/personal/all/${userId}`,
                { withCredentials: true }
            );

            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch messages"
            );
        }
    }
);

export const getMyConversations = createAsyncThunk(
    "conversation/getMyConversations",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(
                "/api/v1/conversation/personal/list",
                { withCredentials: true }
            );

            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch chat list"
            );
        }
    }
);

const conversationSlice = createSlice({
    name: "conversation",

    initialState: {
        messages: [],
        conversations: [],
        loading: false,
        sending: false,
        error: null
    },

    reducers: {
        clearChatError: (state) => {
            state.error = null;
        },

        clearMessages: (state) => {
            state.messages = [];
            state.error = null;
        },
        receivePrivateMessage: (state, action) => {
            const incomingMessage = action.payload;

            if (!incomingMessage?._id) return;

            const alreadyExists = state.messages.some(
                (msg) => msg._id === incomingMessage._id
            );

            if (!alreadyExists) {
                state.messages.push(incomingMessage);
            }
        }
    },

    extraReducers: (builder) => {
        builder

            // Fetch messages
            .addCase(getPrivateMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPrivateMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload.message || [];
            })
            .addCase(getPrivateMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Send message
            .addCase(sendPrivateMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
            })
            .addCase(sendPrivateMessage.fulfilled, (state, action) => {
                state.sending = false;
                state.messages.push(action.payload);
            })
            .addCase(sendPrivateMessage.rejected, (state, action) => {
                state.sending = false;
                state.error = action.payload;
            })
            .addCase(getMyConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
            })
            .addCase(getMyConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }

});

export const { clearChatError, clearMessages, receivePrivateMessage } = conversationSlice.actions;

export default conversationSlice.reducer;
