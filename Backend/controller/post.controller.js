import mongoose, {isValidObjectId} from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiResponse} from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//get all videos
const getAllPosts = asyncHandler(async(req, res) => {
    const { skip=0, limit = 10, query, sortBy="createdAt", sortType="desc", userId} =req.query;
    const limitNumber = Number(limit);
    const skipNumber = Number(skip);
    const matchStage = {}

    if(query){
        matchStage.$or = [
            {title: {$regex: query, $options: "i"}},
            {description: {$regex: query, $options: "i"}}
        ];
    }

    if(userId){
        matchStage.user = new mongoose.Types.ObjectId(userId);
    }
    const sortOrder = sortType === "asc" ? 1: -1;

    const posts = await Post.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: {
                [sortBy]: sortOrder
            }
        },
        {
            $skip: skipNumber
        },
        {
            $limit: limitNumber
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Posts fetched successfully",
            {
                posts
            }
        )
    );

})

//get post by id
const getPostById = asyncHandler(async(req, res) => {
    const { postId } = req.params
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Not Found!!");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            "post fetched successfully",
            {post}
        )
    )
})

//update post
const updatePost = asyncHandler(async(req, res) => {
    const {postId} = req.params;
    const { title, description, duration, isPublished } = req.body;
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "post not found");
    }
    if(post.user.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you are not allowed to update this post");
    }
    if(title!==undefined){
        post.title=title;
    }
    if(description!==undefined){
        post.description=description;
    }
    if(isPublished!==undefined){
        post.isPublished=isPublished;
    }
    //get the files
    const postFile = req.files?.postFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];
    if(postFile){
        const postFileResponse = await uploadOnCloudinary(postFile.path);
        if(!postFileResponse){
            throw new ApiError(500, "Post file upload failed");
        }
        post.postFile = postFileResponse.secure_url;
    }

    if (thumbnail) {

        const thumbnailResponse =
            await uploadOnCloudinary(thumbnail.path);

        if (!thumbnailResponse) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        post.thumbnail = thumbnailResponse.secure_url;
    }
    await post.save();
    return res.status(200).json(
        new ApiResponse(
            200, "post updated successfully", {post}
        )
    )
})

//createpost
const createPost = asyncHandler(async (req, res) => {

    const {
        title,
        description,
        duration,
        isPublished
    } = req.body;

    const postFile = req.files?.postFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!postFile) {
        throw new ApiError(400, "Post file is required");
    }

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail is required");
    }

    if (!title || !description || !duration) {
        throw new ApiError(400, "required fields are not there");
    }

    const postFileResponse =
        await uploadOnCloudinary(postFile.path);

    const thumbnailResponse =
        await uploadOnCloudinary(thumbnail.path);

    if (!postFileResponse) {
        throw new ApiError(500, "Post file upload failed");
    }

    if (!thumbnailResponse) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    const post = await Post.create({
        postFile: postFileResponse.secure_url,
        thumbnail: thumbnailResponse.secure_url,
        title,
        description,
        duration: Number(duration),
        isPublished: isPublished ?? true,
        user: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "post created successfully",
            { post }
        )
    );
});
//delete post
const deletePost = asyncHandler(async(req, res) => {
    const {postId} = req.params;

    const post = await Post.findById(postId);

    if(!post){
        throw new ApiError(404, "post not found")
    }
    if(post.user.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you are not allowed to change");
    }

    await Post.findByIdAndDelete(postId);
    return res.status(200).json(
        new ApiResponse(
            200, "post deleted successfully", {}
        )
    )
})

//get my post
const getMyPosts = asyncHandler(async (req, res) => {

    const posts = await Post.find({
        user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Your posts fetched successfully",
            { posts }
        )
    );
});

export {
    getMyPosts,
    getAllPosts,
    deletePost,
    updatePost,
    createPost,
    getPostById,

}