import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import "../UserStyles/MyPosts.css";
import { useDispatch, useSelector } from "react-redux";
import { getMyPosts } from "../features/post/postSlice";

function MyPosts() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, posts } = useSelector(
        state => state.post
    );

    useEffect(() => {
        dispatch(getMyPosts());
    }, [dispatch]);

    const handlePostClick = (post) => {
        navigate(`/update/${post._id}`);
    };

    return (
        <div className="my-posts-page">

            {/* Top Bar */}
            <div className="my-posts-topbar">
                <Link
                    to="/profile"
                    className="back-btn"
                >
                    <ArrowLeft size={26} />
                </Link>

                <h1>My Posts</h1>

                <div></div>
            </div>

            {/* Posts Grid */}
            <div className="my-posts-grid">

                {posts?.map((post) => (

                    <div
                        className="my-post-card"
                        key={post._id}
                        onClick={() => handlePostClick(post)}
                    >

                        <div className="post-thumbnail">

                            <img
                                src={post.thumbnail}
                                alt={post.title}
                            />

                            <span className="post-type">
                                REEL
                            </span>

                        </div>

                        <div className="post-info">

                            <div>
                                <h3>
                                    {post.title}
                                </h3>

                                <p>
                                    {post.description}
                                </p>
                            </div>

                            <button className="post-menu">
                                <MoreVertical size={20} />
                            </button>

                        </div>

                        <div className="post-meta">

                            <span>
                                {post.views} views
                            </span>

                            <span>
                                {post.duration}s
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default MyPosts;