import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


const toggleLike = asyncHandler(async(req, res)=>{
    const io = req.app.get("io");
    const {postId} = req.params;
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }

    //unlike
    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        post: postId
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        post.likes = Math.max(0, post.likes - 1);
        await post.save();

        io.to(postId).emit("likeUpdated", {
            postId,
            likes: post.likes
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                "Post unliked successfully",
                {
                    liked: false,
                    likes: post.likes
                }
            )
        );
    }
    await Like.create({
        likedBy: req.user._id,
        post: postId
    })
    post.likes+=1;
    await post.save();
    io.to(postId).emit("likeUpdated", {
        postId,
        likes: post.likes
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            "Post liked successfully",
            {
                liked: true,
                likes: post.likes
            }
        )
    );
    
})

//get likes by user id
const getMyLikes = asyncHandler(async(req, res)=>{
    const likes = await Like.find({
        likedBy: req.user._id
    }).populate("post");
    return res.status(200).json(
        new ApiResponse(
            200,
            "Liked posts fetched successfully",
            { likes }
        )
    );
})

export {
    toggleLike,
    getMyLikes
};