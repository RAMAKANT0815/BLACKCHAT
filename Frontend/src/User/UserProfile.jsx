import React, { useEffect } from "react";

import { useNavigate, useParams, useLocation } from "react-router-dom";

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
    shadowUser,
    unshadowUser,
    getShadowStatus,
    getShadows,
    getShadowing
} from "../features/shadow/shadowSlice";

import "../UserStyles/UserProfile.css";


function UserProfile() {

    const { userId } = useParams();

    const dispatch = useDispatch();

    const navigate = useNavigate();


    // =========================
    // USER STATE
    // =========================

    const {
        selectedUser,
        loading
    } = useSelector((state) => state.user);


    // =========================
    // SHADOW STATE
    // =========================

    const {
        shadowStatusByUser,
        shadowsByUser,
        shadowingByUser,
        loadingByUser
    } = useSelector((state) => state.shadow);


    const isShadowing =
        shadowStatusByUser[userId] || false;

    const isShadowLoading =
        loadingByUser[userId] || false;


    // =========================
    // POSTS
    // =========================

    const { posts } = useSelector(
        (state) => state.post
    );


    // =========================
    // GET SHADOW COUNT
    // =========================

    const shadowCount =
        shadowsByUser[userId]?.length || 0;

    const shadowingCount =
        shadowingByUser[userId]?.length || 0;


    // =========================
    // GET PROFILE + POSTS
    // =========================

    useEffect(() => {

        if (!userId) return;

        dispatch(
            getPublicUserProfile(userId)
        );

        dispatch(
            getAllPosts({
                userId: userId
            })
        );

        dispatch(
            getShadowStatus(userId)
        );

        dispatch(
            getShadows(userId)
        );

        dispatch(
            getShadowing(userId)
        );

    }, [dispatch, userId]);


    // =========================
    // SHADOW / UNSHADOW
    // =========================

    const handleFollow = () => {

        if (isShadowing) {

            dispatch(
                unshadowUser(userId)
            );

        } else {

            dispatch(
                shadowUser(userId)
            );

        }
    };


    // =========================
    // OPEN POST
    // =========================

    const handlePostClick = (postId) => {

        navigate(`/post/${postId}`);

    };


    // =========================
    // OPEN CHAT
    // =========================

    
const handleChat = () => {
    if (!selectedUser?._id) {
        console.log("User ID not found");
        return;
    }

    navigate("/chat", {
        state: {
            selectedUser
        }
    });
};


    // =========================
    // OPEN SHADOWS
    // =========================

    const handleShadows = () => {

        navigate(
            `/user/${userId}/shadows`
        );

    };


    // =========================
    // OPEN SHADOWING
    // =========================

    const handleShadowing = () => {

        navigate(
            `/user/${userId}/shadowing`
        );

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="user-profile-loading">
                Loading...
            </div>
        );

    }


    // =========================
    // UI
    // =========================

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
                            style={{
                                cursor: "pointer"
                            }}
                        >

                            <strong>
                                {shadowCount}
                            </strong>

                            <span>
                                Shadows
                            </span>

                        </div>


                        {/* Shadowing */}

                        <div
                            onClick={handleShadowing}
                            style={{
                                cursor: "pointer"
                            }}
                        >

                            <strong>
                                {shadowingCount}
                            </strong>

                            <span>
                                Shadowing
                            </span>

                        </div>

                    </div>


                    {/* Buttons */}

                    <div className="user-profile-actions">


                        {/* Shadow button */}

                        <button
                            className={`follow-user-btn ${
                                isShadowing
                                    ? "following"
                                    : ""
                            }`}
                            onClick={handleFollow}
                            disabled={isShadowLoading}
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


                        {/* Chat button */}

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

                <h2>
                    Posts
                </h2>


                <div className="user-profile-post-grid">

                    {posts?.length > 0 ? (

                        posts.map((post) => (

                            <div
                                className="user-profile-post"
                                key={post._id}
                                onClick={() =>
                                    handlePostClick(
                                        post._id
                                    )
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