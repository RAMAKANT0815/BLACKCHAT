import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Bookmark,
    Share2,
    MoreVertical
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getPostById, updatePostLikes } from "../features/post/postSlice";

import { toggleLike } from "../features/like/likeSlice";

import CommentPost from "../Comment/CommentPost";

import "../PostStyles/PostVideo.css";

function PostVideo() {

    const [shwoComment, setShowComment] = useState(false);

    const { postId } = useParams();

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const { post, loading } = useSelector(
        (state) => state.post
    );

    const { isLiked } = useSelector(
        (state) => state.like
    );
    const handlelike = () => {
        dispatch(toggleLike(postId));
    };
    useEffect(() => {

        const handleLikeUpdate = (data) => {

            if (data.postId === postId) {
                dispatch(updatePostLikes(data));
            }

        };

        socket.on("likeUpdated", handleLikeUpdate);

        return () => {
            socket.off("likeUpdated", handleLikeUpdate);
        };

    }, [postId]);

    useEffect(() => {
        dispatch(getPostById(postId));

        socket.emit("joinPost", postId);

        return () => {
            socket.emit("leavePost", postId);
        };
    }, [dispatch, postId]);

    if (loading) {
        return (
            <div className="reel-loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="reel-page">

            {/* Back button */}
            <button
                className="reel-back-btn"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={30} />
            </button>

            {/* Video */}
            {post && (
                <div
                    className={`reel-container ${
                        shwoComment ? "comment-open" : ""
                    }`}
                >

                    <video
                        className="reel-video"
                        src={post.postFile}
                        controls
                        autoPlay
                        loop
                    />

                    {/* Post information */}
                    <div className="reel-info">
                        <h3>
                            {post.title}
                        </h3>

                        <p>
                            {post.description}
                        </p>
                    </div>

                    {/* Right side actions */}
                    <div className="reel-actions">

                        {/* Like */}
                        <button onClick={handlelike}>
                            <Heart
                                size={32}
                                fill={isLiked ? "red" : "none"}
                            />
                            <span>{post.likes}</span>
                        </button>

                        {/* Comment */}
                        <button
                            onClick={() =>
                                setShowComment(!shwoComment)
                            }
                        >
                            <MessageCircle size={32} />
                            <span>{post.comments}</span>
                        </button>

                        {/* Save */}
                        <button>
                            <Bookmark size={32} />
                            <span>Save</span>
                        </button>

                        {/* Share */}
                        <button>
                            <Share2 size={32} />
                            <span>Share</span>
                        </button>

                        {/* More */}
                        <button>
                            <MoreVertical size={30} />
                        </button>

                    </div>

                    {/* Comments */}
                    {shwoComment && (
                        <CommentPost
                            postId={postId}
                            onClose={() => setShowComment(false)}
                        />
                    )}

                </div>
            )}

        </div>
    );
}

export default PostVideo;