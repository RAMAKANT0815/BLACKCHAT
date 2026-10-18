import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import postReducer from "../features/post/postSlice";
import commentReducer from "../features/comment/commentSlice";
import likeReducer from "../features/like/likeSlice"
import shadowReducer from "../features/shadow/shadowSlice"
import conversationReducer from "../features/conversation/conversationSlice"

export const store = configureStore({
    reducer: {
        comment: commentReducer,
        post: postReducer,
        user: userReducer,
        like: likeReducer,
        shadow: shadowReducer,
        conversation: conversationReducer
    },
});