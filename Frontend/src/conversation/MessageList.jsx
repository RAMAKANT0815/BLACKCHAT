import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message/messageSlice";
import MessageBubble from "./MessageBubble";
import "../conversationStyles/MessageList.css";

const MessageList = ({ conversation }) => {
    const dispatch = useDispatch();

    const { user } = useSelector(
        (state) => state.user
    );

    const {
        messages,
        loading,
        error
    } = useSelector(
        (state) => state.message
    );

    const loggedInUserId = user?._id;

    // Find the other user in private conversation
    const otherUser = conversation?.members?.find(
        (member) =>
            String(member._id) !== String(loggedInUserId)
    );

    const otherUserId = otherUser?._id;

    useEffect(() => {
        if (
            conversation?.type === "private" &&
            otherUserId
        ) {
            dispatch(getMessages(otherUserId));
        }
    }, [
        conversation?._id,
        conversation?.type,
        otherUserId,
        dispatch
    ]);

    if (loading) {
        return (
            <div className="message-list-state">
                Loading messages...
            </div>
        );
    }

    if (error) {
        return (
            <div className="message-list-state error">
                {error}
            </div>
        );
    }

    if (!messages || messages.length === 0) {
        return (
            <div className="message-list-state">
                <p>No messages yet.</p>
            </div>
        );
    }

    return (
        <div className="message-list">

            {messages.map((message) => (
                <MessageBubble
                    key={message._id}
                    message={message}
                />
            ))}

        </div>
    );
};

export default MessageList;