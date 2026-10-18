import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "Plz enter Password"]
        },
        avatar: {
            type: String, // Will store the image URL (e.g., from Cloudinary)
            default: "http://localhost:8000/public/profile.jpeg"
        },
        bio: {
            type: String,
            default: "",
            trim: true
        },
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post" // Links to your Post model
            }
        ],
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        refreshToken: {
            type: String
        }
    },
    { 
        timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return ;
    
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);