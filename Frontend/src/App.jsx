import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "sonner";
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
import UsersListPage from "./pages/UsersListPage";
import Footer from "./components/Footer";
import Home from "./pages/Home"


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update/profile" element={<EditProfile />} />
        <Route path="/" element={<Navigate to="/login" />} />
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
            <Route path='/post/:postId' element={<PostVideo/>}/>
            <Route path="/user/:userId" element={<UserProfile />}/>
            <Route
          path="/shadows"
          element={<UsersListPage type="random" />}
      />

      <Route
          path="/profile/shadows"
          element={<UsersListPage type="my-shadows" />}
      />

      <Route
          path="/profile/shadowing"
          element={<UsersListPage type="my-shadowing" />}
      />

      <Route
          path="/user/:userId/shadows"
          element={<UsersListPage type="user-shadows" />}
      />

      <Route
          path="/user/:userId/shadowing"
          element={<UsersListPage type="user-shadowing" />}
      />
      <Route
          path="/"
          element={<Home />}
      />
      </Routes>
      <Toaster richColors position="top-right" />
      
      <Footer />
    </Router>
    
    </>
  )
}

export default App  
      