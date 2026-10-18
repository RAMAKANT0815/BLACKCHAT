import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./features/user/userSlice";
import Login from './User/Login';
import Register from './User/Register';
import Profile from './User/Profile';
import EditProfile from './User/EditProfile';
import UpdatePassword from './User/UpdatePassword';
import CreatePost from './Post/CreatePost';
import MyPosts from './User/MyPosts';
import UpdatePost from './Post/UpdatePost';
import PostVideo from './Post/PostVideo';
import UserProfile from './User/UserProfile';
import UserBrowser from "./components/UserBrowser";
import Footer from "./components/Footer";
import Home from "./pages/Home"
import MainConversation from './conversation/MainConversation';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);
    return (
        <>
            <Router>
                <Routes>

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/update/profile" element={<EditProfile />} />
                    <Route path="/update/password" element={<UpdatePassword />} />

                    <Route path="/createPost" element={<CreatePost />} />

                    <Route
                        path="/myPosts"
                        element={<MyPosts />}
                    />

                    <Route
                        path="/update/:postId"
                        element={<UpdatePost />}
                    />

                    <Route
                        path="/post/:postId"
                        element={<PostVideo />}
                    />

                    <Route
                        path="/user/:userId"
                        element={<UserProfile />}
                    />

                    <Route
                        path="/shadows"
                        element={<UserBrowser type="random" />}
                    />

                    <Route
                        path="/profile/shadows"
                        element={<UserBrowser type="shadows" />}
                    />

                    <Route
                        path="/profile/shadowing"
                        element={<UserBrowser type="shadowing" />}
                    />

                    <Route
                        path="/user/:userId/shadows"
                        element={<UserBrowser type="shadows" />}
                    />

                    <Route
                        path="/user/:userId/shadowing"
                        element={<UserBrowser type="shadowing" />}
                    />

                    <Route
                        path="/"
                        element={<Home />}
                    />
                    <Route
                        path="/chat"
                        element={<MainConversation />}
                    />

                </Routes>

                <Toaster richColors position="top-right" />
                <Footer />

            </Router>
        </>
    )
}

export default App