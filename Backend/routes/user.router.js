import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logout, 
    editProfile, // The combined controller we just made
    changeCurrentPassword ,
    getUserProfile,
    getPublicUserProfile,
    getRandomUsers
} from "../controller/user.controller.js";

import { verifyUserAuth } from "../middleware/auth.middleware.js"; 
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes (Requires authentication)
router.route("/logout").post(verifyUserAuth, logout);
router.route("/update/password").put(verifyUserAuth, changeCurrentPassword);
router.route("/profile").get(verifyUserAuth, getUserProfile);

router.route("/update/profile").put(verifyUserAuth, upload.single("avatar"), editProfile);
router
    .route("/user/:userId")
    .get(verifyUserAuth, getPublicUserProfile);
router
    .route("/users/random")
    .get(verifyUserAuth, getRandomUsers);

export default router;