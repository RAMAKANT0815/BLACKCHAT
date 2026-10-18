import { Router } from "express";

import {
    getMsgPersonal,
    sendMsgPrivate,
    getMyConversations
} from "../controller/conversation.controller.js";

import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/personal/send/:userId",
    verifyUserAuth,
    sendMsgPrivate
);

router.get(
    "/personal/all/:userId",
    verifyUserAuth,
    getMsgPersonal
);

router.get(
    "/personal/list",
    verifyUserAuth,
    getMyConversations
);

export default router;