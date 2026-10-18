import React, { useEffect, useState } from "react";

import socket from "../socket";

import {
    Heart,
    MessageCircle,
    Bookmark,
    Share2,
    MoreVertical
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { updatePostLikes } from "../features/post/postSlice";
import { toggleLike } from "../features/like/likeSlice";

import CommentPost from "../Comment/CommentPost";



function ReelCard({ post }) {

    const [showComment, setShowComment] = useState(false);

    const dispatch = useDispatch();

    const { isLiked } = useSelector(
        (state) => state.like
    );

    const handleLike = () => {
        dispatch(toggleLike(post._id));
    };

    useEffect(() => {

        const handleLikeUpdate = (data) => {

            if (data.postId === post._id) {
                dispatch(updatePostLikes(data));
            }

        };

        socket.on("likeUpdated", handleLikeUpdate);

        return () => {
            socket.off("likeUpdated", handleLikeUpdate);
        };

    }, [post._id, dispatch]);


    useEffect(() => {

        socket.emit("joinPost", post._id);

        return () => {
            socket.emit("leavePost", post._id);
        };

    }, [post._id]);


    return (
        <div
            className={`reel-container ${
                showComment ? "comment-open" : ""
            }`}
        >

            {/* Video */}

            <video
                className="reel-video"
                src={post.postFile}
                poster={post.thumbnail}
                controls
                muted
                loop
                playsInline
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

                <button onClick={handleLike}>

                    <Heart
                        size={32}
                        fill={
                            isLiked
                                ? "red"
                                : "none"
                        }
                    />

                    <span>
                        {post.likes}
                    </span>

                </button>


                {/* Comment */}

                <button
                    onClick={() =>
                        setShowComment(!showComment)
                    }
                >

                    <MessageCircle size={32} />

                    <span>
                        {post.comments}
                    </span>

                </button>


                {/* Save */}

                <button>

                    <Bookmark size={32} />

                    <span>
                        Save
                    </span>

                </button>


                {/* Share */}

                <button>

                    <Share2 size={32} />

                    <span>
                        Share
                    </span>

                </button>


                {/* More */}

                <button>

                    <MoreVertical size={30} />

                </button>

            </div>


            {/* Comments */}

            {showComment && (
                <CommentPost
                    postId={post._id}
                    onClose={() =>
                        setShowComment(false)
                    }
                />
            )}

        </div>
    );
}

export default ReelCard;