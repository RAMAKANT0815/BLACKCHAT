import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPrivateConversation = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Self chat not allowed
    if (userId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot create chat with yourself");
    }

    // Check conversation already exists
    let conversation = await Conversation.findOne({
        type: "private",
        members: {
            $all: [req.user._id, userId],
            $size: 2
        }
    });

    // If conversation doesn't exist, create it
    if (!conversation) {
        conversation = await Conversation.create({
            type: "private",
            members: [req.user._id, userId]
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Private conversation created successfully",
            { conversation }
        )
    );
});

const getMyConversations = asyncHandler(async (req, res) => {

    const conversations = await Conversation.find({
        members: req.user._id
    })
    .populate("members", "username avatar")
    .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Conversations fetched successfully",
            { conversations }
        )
    );
});

const getConversationById = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        members: req.user._id
    }).populate("members", "username avatar");

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found or you are not a member"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Conversation fetched successfully",
            { conversation }
        )
    );
});

const createGroupConversation = asyncHandler(async (req, res) => {

    const { name, description, members } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Group name is required");
    }

    if (!Array.isArray(members) || members.length === 0) {
        throw new ApiError(
            400,
            "At least one member is required"
        );
    }

    // Remove duplicate members
    const uniqueMembers = [
        ...new Set(
            members.map((member) => member.toString())
        )
    ];

    // Creator should also be a member
    if (
        !uniqueMembers.includes(
            req.user._id.toString()
        )
    ) {
        uniqueMembers.push(req.user._id.toString());
    }

    // Check whether all users exist
    const users = await User.find({
        _id: { $in: uniqueMembers }
    });

    if (users.length !== uniqueMembers.length) {
        throw new ApiError(
            400,
            "One or more users not found"
        );
    }

    const conversation = await Conversation.create({
        type: "group",
        name: name.trim(),
        description: description?.trim() || "",
        createdBy: req.user._id,
        members: uniqueMembers,
        admins: [req.user._id],
        onlyAdminsCanSend: false
    });

    const populatedConversation =
        await Conversation.findById(conversation._id)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(201).json(
        new ApiResponse(
            201,
            "Group created successfully",
            {
                conversation: populatedConversation
            }
        )
    );
});

const addGroupMembers = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;
    const { members } = req.body;

    // 1. Check members array
    if (!Array.isArray(members) || members.length === 0) {
        throw new ApiError(
            400,
            "At least one member is required"
        );
    }

    // 2. Find the group
    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // 3. Check whether logged-in user is admin
    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can add members"
        );
    }

    // 4. Remove duplicate IDs
    const uniqueMembers = [
        ...new Set(
            members.map((member) => member.toString())
        )
    ];

    // 5. Check whether users exist
    const users = await User.find({
        _id: { $in: uniqueMembers }
    });

    if (users.length !== uniqueMembers.length) {
        throw new ApiError(
            400,
            "One or more users not found"
        );
    }

    // 6. Find users who are not already members
    const newMembers = uniqueMembers.filter(
        (memberId) =>
            !conversation.members.some(
                (existingMember) =>
                    existingMember.toString() === memberId
            )
    );

    // 7. Add only new members
    conversation.members.push(...newMembers);

    await conversation.save();

    // 8. Return updated group
    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Members added successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});


const removeGroupMember = asyncHandler(async (req, res) => {

    const { conversationId, userId } = req.params;

    // Find group and check logged-in user is a member
    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // Check whether logged-in user is admin
    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can remove members"
        );
    }

    // Check whether target user is a member
    const isMember = conversation.members.some(
        (member) =>
            member.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(
            400,
            "User is not a member of this group"
        );
    }

    // Admin cannot remove themselves
    if (userId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "Use leave group to remove yourself"
        );
    }

    // Remove user from members
    conversation.members =
        conversation.members.filter(
            (member) =>
                member.toString() !== userId
        );

    // If removed user was an admin,
    // remove them from admins too
    conversation.admins =
        conversation.admins.filter(
            (admin) =>
                admin.toString() !== userId
        );

    await conversation.save();

    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Member removed successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const leaveGroup = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // Remove current user from members
    conversation.members =
        conversation.members.filter(
            (member) =>
                member.toString() !==
                req.user._id.toString()
        );

    // Remove current user from admins
    conversation.admins =
        conversation.admins.filter(
            (admin) =>
                admin.toString() !==
                req.user._id.toString()
        );

    await conversation.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "You left the group successfully"
        )
    );
});

const addGroupAdmin = asyncHandler(async (req, res) => {

    const { conversationId, userId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // Check current user is admin
    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can add another admin"
        );
    }

    // Check target user is a member
    const isMember = conversation.members.some(
        (member) =>
            member.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(
            400,
            "User is not a member of this group"
        );
    }

    // Check whether already admin
    const alreadyAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === userId
    );

    if (alreadyAdmin) {
        throw new ApiError(
            400,
            "User is already an admin"
        );
    }

    conversation.admins.push(userId);

    await conversation.save();

    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "User promoted to admin successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const removeGroupAdmin = asyncHandler(async (req, res) => {

    const { conversationId, userId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // Check current user is admin
    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can remove admin privileges"
        );
    }

    // Check target is admin
    const targetIsAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === userId
    );

    if (!targetIsAdmin) {
        throw new ApiError(
            400,
            "User is not an admin"
        );
    }

    // Don't allow yourself to remove your own admin role
    if (userId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot remove your own admin role"
        );
    }

    conversation.admins =
        conversation.admins.filter(
            (admin) =>
                admin.toString() !== userId
        );

    await conversation.save();

    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Admin role removed successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const updateGroupDetails = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;
    const { name, description } = req.body;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    // Check admin
    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can update group details"
        );
    }

    // Update name if provided
    if (name !== undefined) {

        if (!name.trim()) {
            throw new ApiError(
                400,
                "Group name cannot be empty"
            );
        }

        conversation.name = name.trim();
    }

    // Update description if provided
    if (description !== undefined) {
        conversation.description =
            description.trim();
    }

    await conversation.save();

    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Group details updated successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const updateGroupImage = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can update group image"
        );
    }

    if (!req.file) {
        throw new ApiError(
            400,
            "Group image is required"
        );
    }

    const uploadedImage = await uploadOnCloudinary(
        req.file.path
    );

    if (!uploadedImage) {
        throw new ApiError(
            500,
            "Group image upload failed"
        );
    }

    conversation.image = {
        url: uploadedImage.url,
        public_id: uploadedImage.public_id
    };

    await conversation.save();

    const updatedConversation =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Group image updated successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const updateGroupMessagePermission = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;
    const { onlyAdminsCanSend } = req.body;

    if (typeof onlyAdminsCanSend !== "boolean") {
        throw new ApiError(
            400,
            "onlyAdminsCanSend must be true or false"
        );
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "group",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Group not found or you are not a member"
        );
    }

    const isAdmin = conversation.admins.some(
        (admin) =>
            admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
        throw new ApiError(
            403,
            "Only admins can change message permissions"
        );
    }

    conversation.onlyAdminsCanSend = onlyAdminsCanSend;

    await conversation.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Group message permission updated successfully",
            {
                onlyAdminsCanSend:
                    conversation.onlyAdminsCanSend
            }
        )
    );
});

const createTemporaryConversation = asyncHandler(async (req, res) => {

    const { durationMinutes } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
        throw new ApiError(
            400,
            "Valid duration is required"
        );
    }

    const startTime = new Date();

    const endTime = new Date(
        startTime.getTime() +
        durationMinutes * 60 * 1000
    );

    let roomCode;
    let existingRoom;

    do {
        roomCode = generateRoomCode();

        existingRoom = await Conversation.findOne({
            roomCode
        });

    } while (existingRoom);

    const conversation = await Conversation.create({
        type: "temporary",

        roomCode,

        startTime,

        endTime,

        createdBy: req.user._id,

        members: [
            req.user._id
        ],

        admins: [
            req.user._id
        ]
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Temporary chat created successfully",
            {
                conversation
            }
        )
    );
});

const joinTemporaryConversation = asyncHandler(async (req, res) => {

    const { roomCode } = req.body;

    if (!roomCode || !roomCode.trim()) {
        throw new ApiError(
            400,
            "Room code is required"
        );
    }

    const conversation = await Conversation.findOne({
        type: "temporary",
        roomCode: roomCode.trim().toUpperCase()
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Temporary chat not found"
        );
    }

    // Check whether room has expired
    if (new Date() >= conversation.endTime) {
        throw new ApiError(
            400,
            "This temporary chat has expired"
        );
    }

    // Check whether user is already a member
    const alreadyMember = conversation.members.some(
        (member) =>
            member.toString() === req.user._id.toString()
    );

    // Add user if they are not already a member
    if (!alreadyMember) {
        conversation.members.push(req.user._id);

        await conversation.save();
    }

    const updatedConversation =
        await Conversation.findById(conversation._id)
            .populate("members", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Joined temporary chat successfully",
            {
                conversation: updatedConversation
            }
        )
    );
});

const createCommunityConversation = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(
            400,
            "Community name is required"
        );
    }

    const conversation = await Conversation.create({
        type: "community",

        name: name.trim(),

        description: description?.trim() || "",

        createdBy: req.user._id,

        members: [
            req.user._id
        ],

        admins: [
            req.user._id
        ],

        onlyAdminsCanSend: true
    });

    const populatedConversation =
        await Conversation.findById(conversation._id)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(201).json(
        new ApiResponse(
            201,
            "Community created successfully",
            {
                conversation: populatedConversation
            }
        )
    );
});

const joinCommunity = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Community not found"
        );
    }

    const alreadyMember = conversation.members.some(
        (member) =>
            member.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
        throw new ApiError(
            400,
            "You are already a member of this community"
        );
    }

    conversation.members.push(req.user._id);

    await conversation.save();

    const updatedCommunity =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("admins", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Joined community successfully",
            {
                conversation: updatedCommunity
            }
        )
    );
});

const leaveCommunity = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community",
        members: req.user._id
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Community not found or you are not a member"
        );
    }

    // Creator cannot leave the community
    if (
        conversation.createdBy.toString() ===
        req.user._id.toString()
    ) {
        throw new ApiError(
            400,
            "Community creator cannot leave the community"
        );
    }

    // Remove user from members
    conversation.members =
        conversation.members.filter(
            (member) =>
                member.toString() !==
                req.user._id.toString()
        );

    // Remove user from admins if they are an admin
    conversation.admins =
        conversation.admins.filter(
            (admin) =>
                admin.toString() !==
                req.user._id.toString()
        );

    await conversation.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Left community successfully"
        )
    );
});

const getPublicCommunities = asyncHandler(async (req, res) => {

    const communities = await Conversation.find({
        type: "community"
    })
        .select(
            "name description image createdBy members admins"
        )
        .populate("createdBy", "username avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Communities fetched successfully",
            {
                communities
            }
        )
    );
});

const updateCommunityDetails = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { name, description } = req.body;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(404, "Community not found");
    }

    // Only creator can manage the community
    if (
        conversation.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can update the community"
        );
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new ApiError(
                400,
                "Community name cannot be empty"
            );
        }

        conversation.name = name.trim();
    }

    if (description !== undefined) {
        conversation.description = description.trim();
    }

    await conversation.save();

    const updatedCommunity =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("createdBy", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Community details updated successfully",
            { conversation: updatedCommunity }
        )
    );
});

const deleteCommunity = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Community not found"
        );
    }

    if (
        conversation.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can delete the community"
        );
    }

    await Message.deleteMany({
        conversation: conversationId
    });

    await Conversation.deleteOne({
        _id: conversationId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Community deleted successfully"
        )
    );
});

const updateCommunityImage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(404, "Community not found");
    }

    if (
        conversation.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can update the image"
        );
    }

    if (!req.file) {
        throw new ApiError(
            400,
            "Community image is required"
        );
    }

    const uploadedImage = await uploadOnCloudinary(
        req.file.path
    );

    if (!uploadedImage) {
        throw new ApiError(
            500,
            "Community image upload failed"
        );
    }

    conversation.image = {
        url: uploadedImage.url,
        public_id: uploadedImage.public_id
    };

    await conversation.save();

    const updatedCommunity =
        await Conversation.findById(conversationId)
            .populate("members", "username avatar")
            .populate("createdBy", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Community image updated successfully",
            { conversation: updatedCommunity }
        )
    );
});

const removeCommunityMember = asyncHandler(async (req, res) => {
    const { conversationId, userId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(404, "Community not found");
    }

    // Only creator can remove members
    if (
        conversation.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can remove members"
        );
    }

    // Creator cannot remove themselves
    if (userId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "Community creator cannot be removed"
        );
    }

    const isMember = conversation.members.some(
        (member) =>
            member.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(
            400,
            "User is not a member of this community"
        );
    }

    conversation.members =
        conversation.members.filter(
            (member) =>
                member.toString() !== userId
        );

    await conversation.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Member removed from community successfully"
        )
    );
});

const getCommunityMembers = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        type: "community"
    })
        .populate("members", "username avatar")
        .populate("createdBy", "username avatar");

    if (!conversation) {
        throw new ApiError(404, "Community not found");
    }

    // Only creator can view members
    if (
        conversation.createdBy._id.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can view members"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Community members fetched successfully",
            {
                members: conversation.members,
                memberCount: conversation.members.length,
                creator: conversation.createdBy
            }
        )
    );
});

const deleteCommunityMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    const conversation = await Conversation.findOne({
        _id: message.conversation,
        type: "community"
    });

    if (!conversation) {
        throw new ApiError(
            404,
            "Community not found"
        );
    }

    // Only community creator can delete messages
    if (
        conversation.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only the community creator can delete messages"
        );
    }

    await Message.findByIdAndDelete(messageId);

    const io = req.app.get("io");

    io.to(conversation._id.toString()).emit(
        "message_deleted",
        {
            messageId,
            conversationId: conversation._id
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Community message deleted successfully"
        )
    );
});

const getMessagesByConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

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

    const deletion = conversation.deletedAt.find(
        (item) =>
            item.user.toString() ===
            req.user._id.toString()
    );

    const messageQuery = {
        conversation: conversationId
    };

    if (deletion) {
        messageQuery.createdAt = {
            $gt: deletion.at
        };
    }

    const messages = await Message.find(messageQuery)
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalMessages = await Message.countDocuments(
        messageQuery
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Messages fetched successfully",
            {
                messages: messages.reverse(),
                currentPage: page,
                totalPages: Math.ceil(
                    totalMessages / limit
                ),
                hasMore:
                    page * limit < totalMessages
            }
        )
    );
});


export {
    createPrivateConversation,
    getMyConversations,
    getConversationById,

};