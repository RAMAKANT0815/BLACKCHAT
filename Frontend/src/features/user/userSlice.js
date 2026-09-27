import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

//login user
export const login = createAsyncThunk("/user/login",
    async (userData, { rejectWithValue }) => {
        try {
            const res = await axios.post("/api/v1/login",
                userData,
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            )
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)

//register user
export const register = createAsyncThunk("/user/register",
    async (userData, { rejectWithValue }) => {
        try {
            const res = await axios.post("/api/v1/register",
                userData,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)

//logout user
export const logout = createAsyncThunk("/api/v1/logout",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.post("/api/v1/logout",
                {},
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            )
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)


//get user details
export const getUserDetails = createAsyncThunk("user/getUserDetails",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/api/v1/profile", {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)

//get comments
export const getMyComments = createAsyncThunk("user/getMyComments",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/api/v1/myComments", {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)

//edit profile
export const editProfile = createAsyncThunk("user/editProfile",
    async (userData, { rejectWithValue }) => {
        try {
            const res = await axios.put("/api/v1/update/profile",
                userData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            )
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)

//get likes
export const getMyLikes = createAsyncThunk("user/getMyLikes",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/api/v1/myLikes", {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Something went wrong");
        }
    }
)


//update password
export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        "/api/v1/update/password",
        passwordData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password update failed"
      );
    }
  }
);

//load user
export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/profile");

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "load failed, plz try again"
      );
    }
  }
);

//get another user profile
export const getPublicUserProfile = createAsyncThunk(
    "user/getPublicUserProfile",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                `/api/v1/profile/${userId}`,
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

export const getRandomUsers = createAsyncThunk(
    "user/getRandomUsers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/v1/users/random",
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

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        posts: [],
        likes: [],
        comments: [],
        savedPosts: [],
        randomUsers: [],
        loading: false,
        error: null,
        success: false,
        isAuthenticated: false,
    },
    reducers: {
        removeError: (state) => {
            state.error = null;
        },
        removeSuccess: (state) => {
            state.success = false;
        }
    },
    
    extraReducers: (builder) => {
        builder
        //login
        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user || action.payload; 
            state.success = true;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })
    
        //register
        .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user || action.payload;
            state.success = true;
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })
    
        //logout
        .addCase(logout.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(logout.fulfilled, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
        })
        .addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        //get user details
        .addCase(getUserDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getUserDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.data.user;
        })
        .addCase(getUserDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            
        //get myComments - FIXED TO GUARANTEE ARRAY
        .addCase(getMyComments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getMyComments.fulfilled, (state, action) => {
            state.loading = false;
            state.comments = Array.isArray(action.payload) ? action.payload : (action.payload.comments || []);
        })
        .addCase(getMyComments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    
        //get myLikes - FIXED TO GUARANTEE ARRAY
        .addCase(getMyLikes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getMyLikes.fulfilled, (state, action) => {
            state.loading = false;
            state.likes = Array.isArray(action.payload) ? action.payload : (action.payload.likes || []);
        })
        .addCase(getMyLikes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    

        //edit profile
        .addCase(editProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(editProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload?.user || action.payload;
            state.success = true;
            state.error = null;
            state.message = action.payload.message;
        })
        .addCase(editProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        //update password
        .addCase(updatePassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updatePassword.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload.message;
        })
        .addCase(updatePassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        //load user
        .addCase(loadUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loadUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = Boolean(action.payload?.user || action.payload);
            state.user = action.payload?.user || action.payload || null;
            state.error=null;
        })
        .addCase(loadUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'load failed, plz try again';
            state.isAuthenticated = false;
            state.user=null;
        })

        //get user profile
        .addCase(getPublicUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })

        .addCase(getPublicUserProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedUser = action.payload.data.user;
        })

        .addCase(getPublicUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })


        //random users
        .addCase(getRandomUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getRandomUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.randomUsers = action.payload.data.users;
        })
        .addCase(getRandomUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    }
})

export const { removeError, removeSuccess } = userSlice.actions;
export default userSlice.reducer;