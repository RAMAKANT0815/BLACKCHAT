
import mongoose from "mongoose";

import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Send a private message
const sendMsgPrivate = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    const receiverId = req.params.userId;
    const { message } = req.body;

    if (!senderId) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, "Invalid receiver ID");
    }

    if (senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, "You cannot message yourself");
    }

    if (typeof message !== "string" || !message.trim()) {
        throw new ApiError(400, "Message cannot be empty");
    }

    const receiver = await User.findById(receiverId).select("_id");

    if (!receiver) {
        throw new ApiError(404, "Receiver not found");
    }

    let conversation = await Conversation.findOne({
        type: "personal",
        members: { $all: [senderId, receiverId] },
        $expr: { $eq: [{ $size: "$members" }, 2] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            type: "personal",
            members: [senderId, receiverId]
        });
    }

    const newMsg = await Message.create({
        senderId,
        receiverId,
        message: message.trim()
    });

    conversation.message.push(newMsg._id);
    await conversation.save();

    // Socket.IO delivery will be added after HTTP testing.
    // Deliver the message to the receiver through Socket.IO
    const io = req.app.get("io");

    io.to(receiverId.toString()).emit("new_private_message", {
        message: newMsg
    });
    return res.status(201).json(
        new ApiResponse(
            201,
            "Private message sent successfully",
            newMsg
        )
    );
});

// Get private chat history
const getMsgPersonal = asyncHandler(async (req, res) => {
    const senderId = req.user?._id;
    const receiverId = req.params.userId;

    if (!senderId) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, "Invalid receiver ID");
    }

    if (senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, "You cannot open a chat with yourself");
    }

    const conversation = await Conversation.findOne({
        type: "personal",
        members: { $all: [senderId, receiverId] },
        $expr: { $eq: [{ $size: "$members" }, 2] }
    }).populate("message");

    if (!conversation) {
        throw new ApiError(
            404,
            "No personal conversation found between the users"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Private chat history fetched successfully",
            conversation
        )
    );
});

// Get all users the logged-in user has chatted with
const getMyConversations = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Find messages sent or received by the logged-in user
    const messages = await Message.find({
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    }).sort({ createdAt: -1 });

    // Collect unique chat partners, ordered by recent activity
    const chatPartners = new Map();

    for (const msg of messages) {
        const partnerId =
            msg.senderId.toString() === userId.toString()
                ? msg.receiverId
                : msg.senderId;

        const partnerKey = partnerId.toString();

        if (!chatPartners.has(partnerKey)) {
            chatPartners.set(partnerKey, msg);
        }
    }

    const partnerIds = [...chatPartners.keys()];

    // Fetch profiles of chat partners
    const users = await User.find({
        _id: { $in: partnerIds }
    }).select("_id username avatar isOnline lastSeen");

    const userMap = new Map(
        users.map(user => [user._id.toString(), user])
    );

    // Preserve recent-message ordering
    const conversations = partnerIds
        .map(partnerId => {
            const user = userMap.get(partnerId);
            const lastMessage = chatPartners.get(partnerId);

            if (!user || !lastMessage) return null;

            return {
                user,
                lastMessage,
                updatedAt: lastMessage.createdAt
            };
        })
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Chat list fetched successfully",
            conversations
        )
    );
});


export {
    sendMsgPrivate,
    getMsgPersonal,
    getMyConversations
};
