import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// 1. Changed the name to verifyUserAuth so the router can find it
export const verifyUserAuth = asyncHandler(async(req, res, next) => {
    try {
        // 2. Read the token from the cookie where your login controller saved it
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // 3. Verify using the same secret you used in your User model
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4. Find the user by _id (which is what you saved in the token payload)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
        
    } catch(error){
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});