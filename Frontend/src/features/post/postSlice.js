import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE POST
export const createPost = createAsyncThunk(
    "post/createPost",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "/api/v1/post/createPost",
                formData,
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


// GET MY POSTS
export const getMyPosts = createAsyncThunk(
    "post/getMyPosts",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/v1/post/myPosts",
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


// GET POST BY ID
export const getPostById = createAsyncThunk(
    "post/getPostById",
    async (postId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/post/post/${postId}`,
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


// UPDATE POST
export const updatePost = createAsyncThunk(
    "post/updatePost",
    async ({ postId, formData }, { rejectWithValue }) => {
        try {
            const res = await axios.put(
                `/api/v1/post/update/${postId}`,
                formData,
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


// DELETE POST
export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (postId, { rejectWithValue }) => {
        try {
            const res = await axios.delete(
                `/api/v1/post/delete/${postId}`,
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


// GET ALL POSTS
export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (params, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/v1/post/posts",
                {
                    params,
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
    posts: [],
    post: null,

    // pagination
    hasMore: true,
    skip: 0,
    limit: 10,

    loading: false,
    error: null,
    success: false,
    message: null
};


const postSlice = createSlice({

    name: "post",

    initialState,

    reducers: {

        removeError: (state) => {
            state.error = null;
        },

        removeSuccess: (state) => {
            state.success = false;
            state.message = null;
        },

        updatePostLikes: (state, action) => {
            if (state.post && state.post._id === action.payload.postId) {
                state.post.likes = action.payload.likes;
            }
        }

    },

    extraReducers: (builder) => {

        // CREATE POST
        builder

            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;

                state.posts.unshift(
                    action.payload.data.post
                );
            })

            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // GET MY POSTS
        builder

            .addCase(getMyPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getMyPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.data.posts;
            })

            .addCase(getMyPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // GET POST BY ID
        builder

            .addCase(getPostById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getPostById.fulfilled, (state, action) => {
                state.loading = false;
                state.post = action.payload.data.post;
            })

            .addCase(getPostById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // UPDATE POST
        builder

            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;

                state.post = action.payload.data.post;

                const updatedPost =
                    action.payload.data.post;

                state.posts = state.posts.map((post) =>
                    post._id === updatedPost._id
                        ? updatedPost
                        : post
                );
            })

            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // DELETE POST
        builder

            .addCase(deletePost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(deletePost.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;

                // Remove deleted post from Redux
                const deletedPostId =
                    action.meta.arg;

                state.posts = state.posts.filter(
                    (post) =>
                        post._id !== deletedPostId
                );

                // If currently opened post was deleted
                if (
                    state.post &&
                    state.post._id === deletedPostId
                ) {
                    state.post = null;
                }
            })

            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // GET ALL POSTS
        builder

            .addCase(getAllPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getAllPosts.fulfilled, (state, action) => {
                state.loading = false;

                const newPosts = action.payload.data.posts;

                state.posts.push(...newPosts);

                state.hasMore = action.payload.data.hasMore;
                state.skip = state.skip + newPosts.length;
            })

            .addCase(getAllPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    }
});


export const {
    removeError,
    removeSuccess,
    updatePostLikes
} = postSlice.actions;


export default postSlice.reducer;