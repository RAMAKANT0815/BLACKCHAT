import React from "react";
import "../componentStyles/ConversationItem.css"

function ConversationItem({ conversation, onClick }) {

    // For private chat, find the other user
    const otherMember = conversation.members?.find(
        (member) =>
            member._id !== conversation.createdBy?._id
    );

    const name =
        conversation.type === "private"
            ? otherMember?.username || "Unknown User"
            : conversation.name || "Unnamed";

    const avatar =
        conversation.type === "private"
            ? otherMember?.avatar
            : conversation.image?.url;

    return (
        <div
            className="conversation-item"
            onClick={onClick}
        >

            {/* Avatar */}
            <img
                src={avatar || "/default-avatar.png"}
                alt={name}
                className="conversation-avatar"
            />

            {/* Name + Last Message */}
            <div className="conversation-info">

                <h4>
                    {name}
                </h4>

                <p>
                    No messages yet
                </p>

            </div>

            {/* Time */}
            <div className="conversation-time">
                --
            </div>

        </div>
    );
}

export default ConversationItem;