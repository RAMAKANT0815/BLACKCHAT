import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../UserStyles/Profile.css";

import {
    Pencil,
    Menu,
    Grid3X3,
    MessageCircle,
    Bookmark,
    Heart,
    Plus,
    FileVideo
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
    logout,
    getUserDetails,
    removeError,
    editProfile
} from "../features/user/userSlice";

import { getMyLikes } from "../features/like/likeSlice";
import { getMyComments } from "../features/comment/commentSlice";
import { getMyPosts } from "../features/post/postSlice";
import {
    getShadows,
    getShadowing
} from "../features/shadow/shadowSlice";



function Profile() {

    const [activeTab, setActiveTab] = useState("posts");
    const [showMenu, setShowMenu] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    const {
        loading,
        error,
        success,
        isAuthenticated,
        user,
        savedPosts
    } = useSelector((state) => state.user);


    const { likes } = useSelector((state) => state.like);

    const { comments } = useSelector((state) => state.comment);

    const { posts } = useSelector((state) => state.post);


    const myShadows = useSelector((state) => state.shadow.shadowsByUser[user?._id]) || [];
    const myShadowing = useSelector((state) => state.shadow.shadowingByUser[user?._id]) || [];

    const shadowCount = myShadows.length;
    const shadowingCount = myShadowing.length;

    useEffect(() => {

        dispatch(getUserDetails());
        dispatch(getMyLikes());
        dispatch(getMyPosts());
        dispatch(getMyComments());

    }, [dispatch]);


    useEffect(() => {
        if (!user?._id) return;

        dispatch(getShadows(user._id));
        dispatch(getShadowing(user._id));
    }, [dispatch, user?._id]);


    useEffect(() => {

        if (error) {

            toast.error(error, {
                position: "top-right",
                autoClose: 3000,
            });

            dispatch(removeError());
        }

    }, [dispatch, error]);


    const handleLogout = async () => {

        const result = await dispatch(logout());

        if (logout.fulfilled.match(result)) {
            navigate("/login");
        }

    };


    const handleAvatarChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const formData = new FormData();

        formData.append("avatar", file);

        dispatch(editProfile(formData));
    };


    const handlePostVideoClick = (postId) => {
        navigate(`/post/${postId}`);
    };


    return (

        <div className="profile-page">

            {/* Top Bar */}

            <div className="profile-topbar">

                <h1>{user?.username}</h1>

                <div className="profile-menu">

                    <Menu
                        size={32}
                        className="menu-icon"
                        onClick={() => setShowMenu(!showMenu)}
                    />

                    {showMenu && (

                        <div className="menu-dropdown">

                            <Link to="/createPost">
                                <Plus size={18} />
                                Create Post
                            </Link>

                            <Link to="/myPosts">
                                <FileVideo size={18} />
                                My Posts
                            </Link>

                        </div>

                    )}

                </div>

            </div>


            {/* Profile Header */}

            <div className="profile-header">

                <div className="avatar-container">

                    <img
                        src={
                            user?.avatar ||
                            "http://localhost:8000/public/profile.jpeg"
                        }
                        alt="Profile"
                        className="avatar"
                    />

                    <label className="avatar-edit">

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleAvatarChange}
                        />

                        <Pencil size={25} />

                    </label>

                    <p>{user?.bio}</p>

                </div>


                {/* Shadows / Shadowing */}

                <div className="profile-stats">

                    <div
                        className="stat"
                        onClick={() => navigate("/profile/shadows")}
                    >

                        <h2>{shadowCount || 0}</h2>

                        <p>Shadows</p>

                    </div>


                    <div className="stat-divider"></div>


                    <div
                        className="stat"
                        onClick={() => navigate("/profile/shadowing")}
                    >

                        <h2>{shadowingCount || 0}</h2>

                        <p>Shadowing</p>

                    </div>

                </div>

            </div>


            {/* Profile Buttons */}

            <div className="profile-buttons">

                <Link
                    to="/update/profile"
                    className="edit-profile-btn"
                >
                    Edit Profile
                </Link>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>


            {/* Profile Tabs */}

            <div className="profile-tabs">

                <div
                    className={`profile-tab ${
                        activeTab === "posts" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("posts")}
                >

                    <Grid3X3 size={28} />

                    <span>Posts</span>

                </div>


                <div
                    className={`profile-tab ${
                        activeTab === "comments" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("comments")}
                >

                    <MessageCircle size={28} />

                    <span>Comments</span>

                </div>


                <div
                    className={`profile-tab ${
                        activeTab === "saved" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("saved")}
                >

                    <Bookmark size={28} />

                    <span>Saved Posts</span>

                </div>


                <div
                    className={`profile-tab ${
                        activeTab === "liked" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("liked")}
                >

                    <Heart size={28} />

                    <span>Liked Posts</span>

                </div>

            </div>


            {/* Posts */}

            {activeTab === "posts" && (

                <div className="posts-grid">

                    {posts?.map((post) => (

                        <div
                            className="post"
                            key={post._id}
                            onClick={() =>
                                handlePostVideoClick(post._id)
                            }
                        >

                            <img
                                src={post.thumbnail}
                                alt={post.title}
                            />

                        </div>

                    ))}

                </div>

            )}


            {/* Liked Posts */}

            {activeTab === "liked" && (

                <div className="likes-grid">

                    {likes?.map((like) => (

                        <div
                            className="post"
                            key={like._id}
                            onClick={() =>
                                handlePostVideoClick(
                                    like.post?._id
                                )
                            }
                        >

                            {like.post?.thumbnail && (

                                <img
                                    src={like.post.thumbnail}
                                    alt={like.post.title}
                                />

                            )}

                        </div>

                    ))}

                </div>

            )}


            {/* Comments */}

            {activeTab === "comments" && (

                <div className="comments-grid">

                    {comments?.map((comment) => (

                        <div
                            className="post"
                            key={comment._id}
                            onClick={() =>
                                handlePostVideoClick(
                                    comment.post?._id
                                )
                            }
                        >

                            {comment.post?.thumbnail && (

                                <img
                                    src={comment.post.thumbnail}
                                    alt={comment.post.title}
                                />

                            )}

                        </div>

                    ))}

                </div>

            )}


            {/* Saved Posts */}

            {activeTab === "saved" && (

                <div className="saved-posts-grid">

                    {savedPosts?.map((savedPost) => (

                        <div
                            className="post"
                            key={savedPost._id}
                        >

                            {savedPost.image && (

                                <img
                                    src={savedPost.image?.url}
                                    alt={`Post ${savedPost._id}`}
                                />

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}


export default Profile;