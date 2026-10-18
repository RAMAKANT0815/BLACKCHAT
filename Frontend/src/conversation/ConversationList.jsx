import React from "react";
import { useSelector } from "react-redux";
import "../conversationStyles/ConversationList.css";

const ConversationList = ({
    activeTab,
    selectedConversation,
    setSelectedConversation,
}) => {

    const { conversations, loading, error } = useSelector(
        (state) => state.conversation
    );

    const { user } = useSelector(
        (state) => state.user
    );

    const loggedInUserId = user?._id;

    if (loading) {
        return (
            <div className="conversation-list-state">
                Loading conversations...
            </div>
        );
    }

    if (error) {
        return (
            <div className="conversation-list-state error">
                {error}
            </div>
        );
    }

    const filteredConversations = conversations.filter(
        (conversation) => conversation.type === activeTab
    );

    if (filteredConversations.length === 0) {
        return (
            <div className="conversation-list-state">
                No conversations yet.
            </div>
        );
    }

    return (
        <div className="conversation-list">

            {filteredConversations.map((conversation) => {

                let title = "Conversation";
                let avatar = "";

                /*
                 * PRIVATE CONVERSATION
                 */
                if (conversation.type === "private") {

                    const otherUser = conversation.members?.find(
                        (member) =>
                            String(member._id) !== String(loggedInUserId)
                    );

                    title = otherUser?.username || "User";
                    avatar = otherUser?.avatar || "";
                }

                /*
                 * GROUP / COMMUNITY / TEMPORARY
                 */
                else {

                    title = conversation.name || "Conversation";
                    avatar = conversation.image?.url || "";
                }

                const isSelected =
                    selectedConversation?._id === conversation._id;

                return (
                    <div
                        key={conversation._id}
                        className={`conversation-item ${
                            isSelected ? "selected" : ""
                        }`}
                        onClick={() =>
                            setSelectedConversation(conversation)
                        }
                    >

                        {/* Avatar */}
                        <div className="conversation-avatar">

                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={title}
                                />
                            ) : (
                                <div className="default-avatar">
                                    {title
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                        </div>

                        {/* Conversation information */}
                        <div className="conversation-info">

                            <h3>{title}</h3>

                            <p>
                                {conversation.type === "private"
                                    ? "Private chat"
                                    : conversation.type === "group"
                                    ? "Group chat"
                                    : conversation.type === "community"
                                    ? "Community"
                                    : "Temporary chat"}
                            </p>

                        </div>

                    </div>
                );
            })}

        </div>
    );
};

export default ConversationList;