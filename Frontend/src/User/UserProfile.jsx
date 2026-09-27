import React, { useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    MessageCircle,
    UserPlus,
    UserMinus
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getPublicUserProfile } from "../features/user/userSlice";

import { getAllPosts } from "../features/post/postSlice";

import {
    toggleShadow,
    getShadowCount
} from "../features/shadow/shadowSlice";

import "../UserStyles/UserProfile.css";


function UserProfile() {

    const { userId } = useParams();

    const dispatch = useDispatch();

    const navigate = useNavigate();


    const {
        selectedUser,
        loading
    } = useSelector((state) => state.user);


    const {
        isShadowing,
        shadowCount,
        shadowingCount
    } = useSelector((state) => state.shadow);


    const { posts } = useSelector(
        (state) => state.post
    );


    // Follow / Unfollow

    const handleFollow = () => {
        dispatch(toggleShadow(userId));
    };


    // Get user profile + posts + shadow counts

    useEffect(() => {

        dispatch(getPublicUserProfile(userId));

        dispatch(
            getAllPosts({
                userId: userId
            })
        );

        dispatch(getShadowCount(userId));

    }, [dispatch, userId]);


    // Open post

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };


    // Open chat

    const handleChat = () => {
        navigate(`/chat/${selectedUser?._id}`);
    };


    // Open Shadows list

    const handleShadows = () => {
        navigate(`/user/${userId}/shadows`);
    };


    // Open Shadowing list

    const handleShadowing = () => {
        navigate(`/user/${userId}/shadowing`);
    };


    if (loading) {

        return (
            <div className="user-profile-loading">
                Loading...
            </div>
        );

    }


    return (

        <div className="user-profile-page">

            {/* Back button */}

            <button
                className="user-profile-back"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={25} />
            </button>


            {/* Profile */}

            <div className="user-profile-header">

                {/* Avatar */}

                <div className="user-profile-avatar-section">

                    <img
                        src={
                            selectedUser?.avatar ||
                            "http://localhost:8000/public/profile.jpeg"
                        }
                        alt={selectedUser?.username}
                        className="user-profile-avatar"
                    />

                </div>


                {/* User information */}

                <div className="user-profile-info">

                    <h1>
                        {selectedUser?.username}
                    </h1>


                    <p>
                        {selectedUser?.bio || "No bio"}
                    </p>


                    {/* Stats */}

                    <div className="user-profile-stats">

                        {/* Shadows */}

                        <div
                            onClick={handleShadows}
                            style={{ cursor: "pointer" }}
                        >

                            <strong>
                                {shadowCount || 0}
                            </strong>

                            <span>
                                Shadows
                            </span>

                        </div>


                        {/* Shadowing */}

                        <div
                            onClick={handleShadowing}
                            style={{ cursor: "pointer" }}
                        >

                            <strong>
                                {shadowingCount || 0}
                            </strong>

                            <span>
                                Shadowing
                            </span>

                        </div>

                    </div>


                    {/* Buttons */}

                    <div className="user-profile-actions">

                        <button
                            className={`follow-user-btn ${
                                isShadowing ? "following" : ""
                            }`}
                            onClick={handleFollow}
                            disabled={loading}
                        >

                            {isShadowing ? (

                                <>
                                    <UserMinus size={18} />
                                    Unshadow
                                </>

                            ) : (

                                <>
                                    <UserPlus size={18} />
                                    Shadow
                                </>

                            )}

                        </button>


                        <button
                            className="chat-user-btn"
                            onClick={handleChat}
                        >

                            <MessageCircle size={18} />

                            Chat

                        </button>

                    </div>

                </div>

            </div>


            {/* Posts */}

            <div className="user-profile-post-section">

                <h2>Posts</h2>

                <div className="user-profile-post-grid">

                    {posts?.length > 0 ? (

                        posts.map((post) => (

                            <div
                                className="user-profile-post"
                                key={post._id}
                                onClick={() =>
                                    handlePostClick(post._id)
                                }
                            >

                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                />

                            </div>

                        ))

                    ) : (

                        <p className="no-posts">
                            No posts yet
                        </p>

                    )}

                </div>

            </div>

        </div>
    );
}


export default UserProfile;