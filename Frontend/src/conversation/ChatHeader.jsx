import React from "react";
import { useSelector } from "react-redux";
import "../conversationStyles/ChatHeader.css";

const ChatHeader = ({ conversation }) => {
    const { user } = useSelector((state) => state.user);

    const loggedInUserId = user?._id;

    const otherUser = conversation?.members?.find(
        (member) =>
            String(member._id) !== String(loggedInUserId)
    );

    const title =
        conversation?.type === "private"
            ? otherUser?.username || "User"
            : conversation?.name || "Conversation";

    const avatar =
        conversation?.type === "private"
            ? otherUser?.avatar || ""
            : conversation?.image?.url || "";

    return (
        <div className="chat-header">

            <div className="chat-header-avatar">

                {avatar ? (
                    <img
                        src={avatar}
                        alt={title}
                    />
                ) : (
                    <div className="chat-header-default-avatar">
                        {title.charAt(0).toUpperCase()}
                    </div>
                )}

            </div>

            <div className="chat-header-info">

                <h3>{title}</h3>

                {conversation?.type === "private" && (
                    <p>
                        {otherUser?.isOnline
                            ? "Online"
                            : "Offline"}
                    </p>
                )}

                {conversation?.type === "group" && (
                    <p>
                        {conversation?.members?.length || 0} members
                    </p>
                )}

                {conversation?.type === "community" && (
                    <p>Community</p>
                )}

                {conversation?.type === "temporary" && (
                    <p>Anonymous chat</p>
                )}

            </div>

        </div>
    );
};

export default ChatHeader;