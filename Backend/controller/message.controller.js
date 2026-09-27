import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getMessagesByConversation = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    // Check conversation exists and user is a member
    const conversation = await Conversation.findOne({
        _id: conversationId,
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found or you are not a member"
        );
    }

    // Find when the logged-in user deleted the chat
    const deletion = conversation.deletedAt.find(
        (item) =>
            item.user.toString() === req.user._id.toString()
    );

    // Create message query
    const messageQuery = {
        conversation: conversationId
    };

    // If user deleted the chat before,
    // show only messages created after deletion
    if (deletion) {
        messageQuery.createdAt = {
            $gt: deletion.at
        };
    }

    // Get messages
    const messages = await Message.find(messageQuery)
        .populate("sender", "username avatar")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Messages fetched successfully",
            { messages }
        )
    );
});

const sendMessage = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;
    const { messageType, content } = req.body;

    // 1. Check conversation and membership
    const conversation = await Conversation.findOne({
        _id: conversationId,
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found or you are not a member"
        );
    }

    // 2. Admin-only check
    if (conversation.onlyAdminsCanSend) {

        const isAdmin = conversation.admins.some(
            (admin) =>
                admin.toString() === req.user._id.toString()
        );

        if (!isAdmin) {
            throw new ApiError(
                403,
                "Only admins can send messages in this conversation"
            );
        }
    }

    // 3. Validate message type
    const allowedTypes = [
        "text",
        "image",
        "video",
        "file"
    ];

    if (!allowedTypes.includes(messageType)) {
        throw new ApiError(400, "Invalid message type");
    }

    // 4. Text message
    if (messageType === "text") {

        if (!content || !content.trim()) {
            throw new ApiError(
                400,
                "Message content is required"
            );
        }
    }

    // 5. Media message
    let fileData = null;

    if (
        messageType === "image" ||
        messageType === "video" ||
        messageType === "file"
    ) {

        if (!req.file) {
            throw new ApiError(
                400,
                "File is required"
            );
        }

        const uploadedFile = await uploadOnCloudinary(
            req.file.path
        );

        if (!uploadedFile) {
            throw new ApiError(
                500,
                "File upload failed"
            );
        }

        fileData = {
            url: uploadedFile.url,
            public_id: uploadedFile.public_id,
            name: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        };
    }

    // 6. Create message
    const message = await Message.create({
        conversation: conversationId,
        sender: req.user._id,
        messageType,
        content: messageType === "text" ? content.trim() : "",
        file: fileData || {}
    });

    // 7. Get sender information
    const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username avatar");

    const io = req.app.get("io");

    io.to(conversationId).emit(
        "message_received",
        populatedMessage
    );


    return res.status(201).json(
        new ApiResponse(
            201,
            "Message sent successfully",
            {
                message: populatedMessage
            }
        )
    );
});

const deleteConversation = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found or you are not a member"
        );
    }

    // Check if user has already deleted this conversation
    const alreadyDeleted = conversation.deletedAt.some(
        (item) =>
            item.user.toString() === req.user._id.toString()
    );

    if (!alreadyDeleted) {
        conversation.deletedAt.push({
            user: req.user._id,
            at: new Date()
        });

        await conversation.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Conversation deleted for you successfully"
        )
    );
});


const markMessagesAsSeen = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    // Check whether user belongs to this conversation
    const conversation = await Conversation.findOne({
        _id: conversationId,
        members: req.user._id
    });
    

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found or you are not a member"
        );
    }
    if (
        conversation.type === "temporary" &&
        new Date() >= conversation.endTime
    ) {
        throw new ApiError(
            400,
            "This temporary chat has expired"
        );
    }

    // Mark messages sent by the other user as seen
    await Message.updateMany(
        {
            conversation: conversationId,
            sender: { $ne: req.user._id },
            seenAt: null
        },
        {
            $set: {
                seenAt: new Date(),
                deliveredAt: new Date()
            }
        }
    );

    const io = req.app.get("io");

    io.to(conversationId).emit("messages_seen", {
        conversationId,
        seenBy: req.user._id,
        seenAt
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Messages marked as seen successfully"
        )
    );
});

export {
    getMessagesByConversation,
    sendMessage,
    deleteConversation,
    markMessagesAsSeen
};