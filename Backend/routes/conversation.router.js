import { Router } from "express";

import {
    createPrivateConversation,
    getMyConversations,
    getConversationById,
    deleteConversation
} from "../controller/conversation.controller.js";

import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Create / find private conversation
router.route("/private/:userId").post(
    verifyUserAuth,
    createPrivateConversation
);

// Get all conversations of logged-in user
router.route("/").get(
    verifyUserAuth,
    getMyConversations
);

// Get one conversation
router.route("/:conversationId").get(
    verifyUserAuth,
    getConversationById
);

// Delete conversation for logged-in user
router.route("/:conversationId").delete(
    verifyUserAuth,
    deleteConversation
);

export default router;