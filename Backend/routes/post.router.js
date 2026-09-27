import { Router } from "express";

import {
    getMyPosts,
    getAllPosts,
    deletePost,
    updatePost,
    createPost,
    getPostById,
} from "../controller/post.controller.js";

import {verifyUserAuth} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();


// Create post
router.route("/createPost").post(
    verifyUserAuth,
    upload.fields([
        {
            name: "postFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    createPost
);


// Get all posts
router.route("/posts").get(
    verifyUserAuth,
    getAllPosts
);


// Get one post by ID
router.route("/post/:postId").get(
    verifyUserAuth,
    getPostById
);


// Update post
router.route("/update/:postId").put(
    verifyUserAuth,
    upload.fields([
        {
            name: "postFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    updatePost
);


// Delete post
router.route("/delete/:postId").delete(
    verifyUserAuth,
    deletePost
);


// Get logged-in user's posts
router.route("/myPosts").get(
    verifyUserAuth,
    getMyPosts
);


export default router;