import express from "express";

import {
    shadowUser,
    unshadowUser,
    getShadows,
    getShadowing,
    getShadowStatus,
    getMultipleShadowStatus
} from "../controller/shadow.controller.js";

import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();



// =========================
// SHADOW USER
// =========================

router.route("/:userId").post(
    verifyUserAuth,
    shadowUser
);


// =========================
// UNSHADOW USER
// =========================

router.route("/:userId").delete(
    verifyUserAuth,
    unshadowUser
);


// =========================
// GET USERS WHO SHADOW THIS USER
// =========================

router.route("/:userId/shadows").get(
    verifyUserAuth,
    getShadows
);


// =========================
// GET USERS THIS USER IS SHADOWING
// =========================

router.route("/:userId/shadowing").get(
    verifyUserAuth,
    getShadowing
);


// =========================
// CHECK SHADOW STATUS
// =========================

router.route("/:userId/status").get(
    verifyUserAuth,
    getShadowStatus
);


// =========================
// MULTIPLE SHADOW STATUS
// =========================

router.route("/status/multiple").post(
    verifyUserAuth,
    getMultipleShadowStatus
);


export default router;