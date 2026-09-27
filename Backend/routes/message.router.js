import { Router } from "express";

import {
    getMessagesByConversation,
    sendMessage,
    markMessagesAsSeen
} from "../controller/message.controller.js";

import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Get messages of a private conversation
router.route("/:conversationId").get(
    verifyUserAuth,
    getMessagesByConversation
);

// Send text/image/video/file message
router.route("/:conversationId").post(
    verifyUserAuth,
    sendMessage
);

router.route("/:conversationId/seen").patch(
    verifyUserAuth,
    markMessagesAsSeen
);

export default router;