import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// my comments

const getMyComments = asyncHandler(async (req, res) => {

    const comments = await Comment.find({
        user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Your comments fetched successfully",
            { comments }
        )
    );
});


// comments of a post

const getPostsComments = asyncHandler(async (req, res) => {

    const { postId } = req.params;

    const comments = await Comment.find({
        post: postId
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Post comments fetched successfully",
            { comments }
        )
    );
});


// create comment

const createComment = asyncHandler(async (req, res) => {

    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content required");
    }

    const comment = await Comment.create({
        content,
        user: req.user._id,
        post: postId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "comment created successfully",
            { comment }
        )
    );
});


// delete comment

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (
        comment.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "you are not allowed to change"
        );
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "comment deleted successfully"
        )
    );
});


// update comment

const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    if (
        comment.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "you are not allowed to update this comment"
        );
    }

    if (content !== undefined) {
        comment.content = content;
    }

    await comment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "comment updated successfully",
            { comment }
        )
    );
});


export {
    updateComment,
    deleteComment,
    createComment,
    getPostsComments,
    getMyComments
};