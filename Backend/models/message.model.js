import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "file",
                "system"
            ],
            default: "text"
        },

        content: {
            type: String,
            default: "",
            trim: true
        },

        file: {
            url: {
                type: String,
                default: ""
            },

            public_id: {
                type: String,
                default: ""
            },

            name: {
                type: String,
                default: ""
            },

            size: {
                type: Number,
                default: 0
            },

            mimeType: {
                type: String,
                default: ""
            }
        },
        deliveredAt: {
            type: Date,
            default: null
        },

        seenAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const Message = mongoose.model(
    "Message",
    messageSchema
);