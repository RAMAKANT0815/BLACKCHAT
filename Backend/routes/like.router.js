import { Router } from "express";

import { toggleLike, getMyLikes } from "../controller/like.controller.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:postId").post(
    verifyUserAuth,
    toggleLike
);

router.route("/myLikes").get(
    verifyUserAuth,
    getMyLikes
);

export default router;