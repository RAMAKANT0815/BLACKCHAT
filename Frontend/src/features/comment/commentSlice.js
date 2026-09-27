import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createComment = createAsyncThunk(
    "comment/createComment",
    async ({ postId, content }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `/api/v1/comment/${postId}/createcomment`,
                { content },
                { withCredentials: true }
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

export const getMyComments = createAsyncThunk(
    "comment/getMyComments",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/v1/comment/myComments",
                { withCredentials: true }
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

export const getMyPostsComments = createAsyncThunk(
    "comment/getMyPostsComments",
    async (postId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/comment/${postId}/comments`,
                { withCredentials: true }
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

export const updateComment = createAsyncThunk(
    "comment/updateComment",
    async ({ commentId, content }, { rejectWithValue }) => {
        try {
            const res = await axios.put(
                `/api/v1/comment/update/${commentId}`,
                { content },
                { withCredentials: true }
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

export const deleteComment = createAsyncThunk(
    "comment/deleteComment",
    async (commentId, { rejectWithValue }) => {
        try {
            const res = await axios.delete(
                `/api/v1/comment/delete/${commentId}`,
                { withCredentials: true }
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
    comments: [],
    loading: false,
    error: null,
    success: false
};

const commentSlice = createSlice({
    name: "comment",
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

        // CREATE COMMENT
        builder
            .addCase(createComment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.comments.unshift(action.payload.data.comment);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        // GET MY COMMENTS
        builder
            .addCase(getMyComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.data.comments;
            })
            .addCase(getMyComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // GET POST COMMENTS
        builder
            .addCase(getMyPostsComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyPostsComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.data.comments;
            })
            .addCase(getMyPostsComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // UPDATE COMMENT
        builder
            .addCase(updateComment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                const updatedComment = action.payload.data.comment;

                const index = state.comments.findIndex(
                    (comment) => comment._id === updatedComment._id
                );

                if (index !== -1) {
                    state.comments[index] = updatedComment;
                }
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        // DELETE COMMENT
        builder
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                const commentId = action.meta.arg;

                state.comments = state.comments.filter(
                    (comment) => comment._id !== commentId
                );
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const {
    removeError,
    removeSuccess
} = commentSlice.actions;

export default commentSlice.reducer;