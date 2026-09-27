import { Router } from "express";

import { createComment, deleteComment, getMyComments, getPostsComments, updateComment } from "../controller/comment.controller.js";

import {verifyUserAuth} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();


// Create post
router.route("/:postId/createcomment").post(
    verifyUserAuth,
    createComment
);


// Get my comments
router.route("/myComments").get(
    verifyUserAuth,
    getMyComments
);

//get comment of posts
router.route("/post/comments").get(
    verifyUserAuth,
    getPostsComments
);


//Get one post by ID
// router.route("/comment/:commentId").get(
//     verifyUserAuth,
//     getPostById
// );


// Update post
router.route("/update/:commentId").put(
    verifyUserAuth,
    updateComment
);


// Delete post
router.route("/delete/:commentId").delete(
    verifyUserAuth,
    deleteComment
);



export default router;