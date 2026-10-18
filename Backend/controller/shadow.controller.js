import { Shadow } from "../models/shadow.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// SHADOW USER

const shadowUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    // Check target user
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    // Cannot shadow yourself
    if (
        userId.toString() ===
        req.user._id.toString()
    ) {
        throw new ApiError(
            400,
            "You cannot shadow yourself"
        );
    }

    // Check existing shadow
    const existingShadow = await Shadow.findOne({
        shadow: req.user._id,
        shadowing: userId
    });

    if (existingShadow) {
        throw new ApiError(
            400,
            "You are already shadowing this user"
        );
    }

    // Create shadow relationship
    await Shadow.create({
        shadow: req.user._id,
        shadowing: userId
    });

    // Add target user to my following
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: {
                following: userId
            }
        }
    );

    // Add me to target user's followers
    await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: {
                followers: req.user._id
            }
        }
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "User shadowed successfully"
        )
    );
});


const unshadowUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    // Check target user
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    // Find shadow relationship
    const shadow = await Shadow.findOne({
        shadow: req.user._id,
        shadowing: userId
    });

    if (!shadow) {
        throw new ApiError(
            400,
            "You are not shadowing this user"
        );
    }

    // Remove shadow relationship
    await Shadow.findByIdAndDelete(shadow._id);

    // Remove target from my following
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: {
                following: userId
            }
        }
    );

    // Remove me from target user's followers
    await User.findByIdAndUpdate(
        userId,
        {
            $pull: {
                followers: req.user._id
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "User unshadowed successfully"
        )
    );
});

// Get Shadowing
// Returns people this user follows
const getShadowing = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const shadowing = await Shadow.find({
        shadow: userId
    })
        .populate(
            "shadowing",
            "username avatar bio"
        )
        .sort({ _id: -1 });

    const users = shadowing.map(
        (item) => item.shadowing
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Shadowing users fetched successfully",
            {
                users
            }
        )
    );
});

// Get Shadows
// Returns people who follow this user

const getShadows = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const shadows = await Shadow.find({
        shadowing: userId
    })
        .populate(
            "shadow",
            "username avatar bio"
        )
        .sort({ _id: -1 });

    const users = shadows.map(
        (item) => item.shadow
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Shadows fetched successfully",
            {
                users
            }
        )
    );
});

const getShadowStatus = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const shadow = await Shadow.findOne({
        shadow: req.user._id,
        shadowing: userId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Shadow status fetched successfully",
            {
                isShadowing: !!shadow
            }
        )
    );
});

const getMultipleShadowStatus = asyncHandler(async (req, res) => {

    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
        throw new ApiError(400, "userIds must be an array");
    }

    const shadows = await Shadow.find({
        shadow: req.user._id,
        shadowing: { $in: userIds }
    }).select("shadowing");

    const status = {};

    userIds.forEach((userId) => {
        status[userId] = false;
    });

    shadows.forEach((item) => {
        status[item.shadowing.toString()] = true;
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Shadow status fetched successfully",
            { status }
        )
    );
});

export {
    shadowUser,
    unshadowUser,
    getShadows,
    getShadowing,
    getShadowStatus,
    getMultipleShadowStatus
};
