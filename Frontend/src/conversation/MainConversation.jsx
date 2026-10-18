import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import socket from "../socket";

import {
    getPrivateMessages,
    sendPrivateMessage,
    getMyConversations,
    clearMessages,
    receivePrivateMessage
} from "../features/conversation/conversationSlice";

import "../conversationStyles/MainConversation.css";

function MainConversation() {
    const dispatch = useDispatch();
    const location = useLocation();

    const {
        messages,
        conversations,
        loading,
        sending,
        error
    } = useSelector((state) => state.conversation);

    const { user } = useSelector((state) => state.user);
    useEffect(() => {
        console.log("Current logged-in user:", user?._id);
    }, [user]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");

    // Listen for incoming real-time messages
    useEffect(() => {
        const handleNewMessage = ({ message: incomingMessage }) => {
            if (!incomingMessage?._id) return;

            const currentUserId = String(user?._id);
            const senderId = String(
                incomingMessage.senderId?._id ||
                incomingMessage.senderId
            );
            const receiverId = String(
                incomingMessage.receiverId?._id ||
                incomingMessage.receiverId
            );

            // Verify that the message belongs to the logged-in user
            if (
                senderId !== currentUserId &&
                receiverId !== currentUserId
            ) {
                return;
            }

            // Identify the other participant
            const otherUserId =
                senderId === currentUserId ? receiverId : senderId;

            // Add the message only when its chat is currently open
            if (String(selectedUser?._id) === otherUserId) {
                dispatch(receivePrivateMessage(incomingMessage));
            }

            // Refresh the conversation sidebar
            dispatch(getMyConversations());
        };

        socket.on("new_private_message", handleNewMessage);

        return () => {
            socket.off("new_private_message", handleNewMessage);
        };
    }, [socket, dispatch, selectedUser, user?._id]);
    // Socket connection test
    useEffect(() => {
    const handleConnect = () => {
        console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
        console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (error) => {
        console.error("Socket connection error:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
        socket.connect();
    }

    return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);

        // Don't disconnect the shared socket when this component unmounts.
    };
}, []);

    // Select user passed from UserProfile
    useEffect(() => {
        if (location.state?.selectedUser) {
            setSelectedUser(location.state.selectedUser);
        }
    }, [location.state]);

    // Fetch chat list when the page opens
    useEffect(() => {
        dispatch(getMyConversations());
    }, [dispatch]);

    // Fetch message history when a user is selected
    useEffect(() => {
        if (selectedUser?._id) {
            dispatch(clearMessages());
            dispatch(getPrivateMessages(selectedUser._id));
        }
    }, [selectedUser, dispatch]);

    // Send a private message
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedUser?._id || sending) {
            return;
        }

        const text = message.trim();

        const result = await dispatch(
            sendPrivateMessage({
                userId: selectedUser._id,
                message: text
            })
        );

        if (sendPrivateMessage.fulfilled.match(result)) {
            setMessage("");
            dispatch(getMyConversations());
        }
    };

    return (
        <div className="main-conversation">

            {/* Left: Chat list */}
            <aside className="chat-sidebar">

                <div className="chat-sidebar-header">
                    <h2>Private Chats</h2>
                    <p>Your conversations</p>
                </div>

                <div className="chat-list">
                    {conversations?.length > 0 ? (
                        conversations.map((chat) => {
                            const chatUser = chat.user;

                            if (!chatUser?._id) {
                                return null;
                            }

                            const isSelected =
                                selectedUser?._id === chatUser._id;

                            return (
                                <button
                                    key={chatUser._id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedUser(chatUser)
                                    }
                                    className={`chat-list-item ${
                                        isSelected ? "active" : ""
                                    }`}
                                >
                                    <img
                                        src={
                                            chatUser.avatar ||
                                            "/default-avatar.png"
                                        }
                                        alt={chatUser.username}
                                        className="chat-avatar"
                                    />

                                    <div className="chat-user-details">
                                        <p className="chat-user-name">
                                            {chatUser.username}
                                        </p>

                                        <p className="chat-last-message">
                                            {chat.lastMessage?.message ||
                                                "No message"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <p className="chat-list-empty">
                            No conversations yet.
                        </p>
                    )}
                </div>
            </aside>

            {/* Right: Selected chat */}
            <section className="chat-main">
                {selectedUser ? (
                    <>
                        <header className="chat-header">
                            <img
                                src={
                                    selectedUser.avatar ||
                                    "/default-avatar.png"
                                }
                                alt={selectedUser.username}
                                className="chat-avatar"
                            />

                            <h3>{selectedUser.username}</h3>
                        </header>

                        {/* Messages */}
                        <div className="chat-messages">
                            {loading && (
                                <p className="chat-status">
                                    Loading messages...
                                </p>
                            )}

                            {!loading &&
                                messages.map((msg) => {
                                    const isSender =
                                        String(msg.senderId?._id || msg.senderId) ===
                                        String(user?._id);

                                    return (
                                        <div
                                            key={msg._id}
                                            className={`chat-message-row ${
                                                isSender
                                                    ? "sender"
                                                    : "receiver"
                                            }`}
                                        >
                                            <div className="chat-message-bubble">
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}

                            {!loading && messages.length === 0 && (
                                <p className="chat-status">
                                    No messages yet. Say hello!
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="chat-error">{error}</p>
                        )}

                        {/* Message input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="chat-input-form"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                placeholder="Type a message..."
                                className="chat-input"
                            />

                            <button
                                type="submit"
                                disabled={sending || !message.trim()}
                                className="chat-send-button"
                            >
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-welcome">
                        <h2>Welcome to BlackChat</h2>
                        <p>
                            Select a conversation to start messaging.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MainConversation;
