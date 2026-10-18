import React from "react";
import { useSelector } from "react-redux";
import "../conversationStyles/MessageBubble.css";

const MessageBubble = ({ message }) => {
    const { user } = useSelector(
        (state) => state.user
    );

    const loggedInUserId = user?._id;

    const senderId =
        message?.senderId?._id || message?.senderId;

    const isOwnMessage =
        String(senderId) === String(loggedInUserId);

    return (
        <div
            className={`message-row ${
                isOwnMessage
                    ? "message-sent"
                    : "message-received"
            }`}
        >

            <div className="message-bubble">

                <p className="message-content">
                    {message?.message}
                </p>

                <span className="message-time">
                    {message?.createdAt
                        ? new Date(
                              message.createdAt
                          ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : ""}
                </span>

            </div>

        </div>
    );
};

export default MessageBubble;