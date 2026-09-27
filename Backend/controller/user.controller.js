import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//generate refresh and accessToken
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); // Fixed spelling
    
    user.refreshToken = refreshToken; // Fixed spelling
    await user.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };
};

//register
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if ([username, password].some((f) => f?.trim() === "")) {
        throw new ApiError(400, "some fields are empty");
    }

    const existedUser = await User.findOne({ username }).maxTimeMS(5000);;

    if (existedUser) {
        throw new ApiError(409, "this username exist try again");
    }


    const user = await User.create({
        username: username.toLowerCase(),
        password
    });


    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    console.log("7. User fetched", createdUser);

    if (!createdUser) {
        throw new ApiError(
            500,
            "something went wrong while registering the user"
        );
    }


    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            { user: createdUser }
        )
    );
});

//login user 
const loginUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body;

    if ([username, password].some((f) => f?.trim() === "")) {
        throw new ApiError(400, "Some fields are empty");
    }

    const user = await User.findOne({
        username: username.toLowerCase()
    });

    if (!user) {
        throw new ApiError(404, "User not found, please register first");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }
            )
        );
});
//logout user
const logout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined // Fixed spelling
            }
        },
        { new: true }
    );
    
    const options = {
        httpOnly: true,
        secure: true
    };
    
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "user logged out successfully", {}));
});

//edit profile 
const editProfile = asyncHandler(async (req, res) => {

    const { username, bio } = req.body;

    const updateData = {};

    // 1. Update text fields if provided
    if (username) {
        updateData.username = username.toLowerCase();
    }

    if (bio) {
        updateData.bio = bio;
    }

    // 2. Upload avatar to Cloudinary
    if (req.file) {

        const avatarResponse = await uploadOnCloudinary(req.file.path);

        if (!avatarResponse) {
            throw new ApiError(500, "Avatar upload failed");
        }

        updateData.avatar = avatarResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
            { user: updatedUser }
        )
    );
});

//change current password
const changeCurrentPassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password");
    }
    
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    
    return res.status(200).json(
        new ApiResponse(200, "password updated successfully", {})
    );
});

//get user profile
const getUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, "User profile retrieved successfully", { user })
    );
});

//get public profile user
// get public user profile
const getPublicUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId)
        .select("username avatar bio createdAt");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "User profile retrieved successfully",
            { user }
        )
    );
});

//get random users
const getRandomUsers = asyncHandler(async (req, res) => {

    const users = await User.aggregate([
        {
            $match: {
                _id: {
                    $ne: new mongoose.Types.ObjectId(req.user._id)
                }
            }
        },
        {
            $sample: {
                size: 20
            }
        },
        {
            $project: {
                username: 1,
                avatar: 1,
                bio: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Random users fetched successfully",
            { users }
        )
    );
});

export {
    registerUser, 
    loginUser, 
    logout, 
    editProfile,
    changeCurrentPassword,
    getUserProfile,
    getPublicUserProfile,
    getRandomUsers
};