import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "../conversationStyles/ChatWindow.css";

const ChatWindow = ({ conversation }) => {
    return (
        <div className="chat-window">

            <ChatHeader
                conversation={conversation}
            />

            <MessageList
                conversation={conversation}
            />

            <MessageInput
                conversation={conversation}
            />

        </div>
    );
};

export default ChatWindow;