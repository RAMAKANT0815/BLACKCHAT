import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        postFile: {
            type: String,
            required: true
        },

        thumbnail: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: {
            type: Number,
            default: 0
        },
        comment: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const Post = mongoose.model("Post", postSchema);