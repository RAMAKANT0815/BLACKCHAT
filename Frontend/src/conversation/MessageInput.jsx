import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../features/message/messageSlice";
import "../conversationStyles/MessageInput.css";

const MessageInput = ({ conversation }) => {
    const dispatch = useDispatch();

    const { user } = useSelector(
        (state) => state.user
    );

    const [message, setMessage] = useState("");

    const handleSend = () => {
        const text = message.trim();

        if (!text) return;

        if (conversation?.type !== "private") return;

        const loggedInUserId = user?._id;

        const receiver = conversation?.members?.find(
            (member) =>
                String(member._id) !== String(loggedInUserId)
        );

        if (!receiver?._id) return;

        dispatch(
            sendMessage({
                receiverId: receiver._id,
                message: text,
            })
        );

        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input-container">

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
            />

            <button
                type="button"
                onClick={handleSend}
            >
                ➤
            </button>

        </div>
    );
};

export default MessageInput;