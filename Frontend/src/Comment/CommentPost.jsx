import React, { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import "../CommentStyles/CommentPost.css";
import { useDispatch, useSelector } from "react-redux";
import { createComment } from "../features/comment/commentSlice";
import socket from "../socket";

function CommentPost({ postId, onClose }) {

    const { comments, loading } = useSelector(
        (state) => state.comment
    );
    const [textComment, setTextComment] = useState("");


    const dispatch = useDispatch();
    const handleSend = () => {
        if (!textComment.trim()) return;

        dispatch(
            createComment({
                postId,
                content: textComment
            })
        );

        setTextComment("");
    };

    useEffect(() => {
        const handleNewComment = (data) => {
            if (data.postId === postId) {
                console.log("New comment:", data.comment);

                // update Redux/UI here
            }
        };

        socket.on("newComment", handleNewComment);

        return () => {
            socket.off("newComment", handleNewComment);
        };
    }, [postId]);
    return (
        <div className="comment-panel">

            <div className="comment-header">
                <h2>Comments</h2>

                <button onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="comment-list">

                {loading && <p>Loading comments...</p>}

                {comments?.map((comment) => (
                    <div
                        className="comment-item"
                        key={comment._id}
                    >
                        <div className="comment-user">

                            <img
                                src={
                                    comment.user?.avatar ||
                                    "/profile.jpeg"
                                }
                                alt={comment.user?.username}
                            />

                            <strong>
                                {comment.user?.username}
                            </strong>

                        </div>

                        <p>{comment.content}</p>

                    </div>
                ))}

            </div>

            <div className="comment-input">

                <input
                    type="text"
                    placeholder="Add a comment..."
                    onChange={(e) => setTextComment(e.target.value)}
                />

                <button>
                    <Send size={20} onClick={handleSend}/>
                </button>

            </div>

        </div>
    );
}

export default CommentPost;