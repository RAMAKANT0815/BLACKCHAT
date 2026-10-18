
import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        // Type of conversation
        type: {
            type: String,
            enum: ["personal", "group", "temporary", "community"],
            required: true,
            default: "personal"
        },

        // Group/community name; null for personal chats
        name: {
            type: String,
            trim: true,
            default: null
        },

        // Users who belong to this conversation
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        // Users permitted to perform admin actions
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        // Group-level permissions
        settings: {
            onlyAdminsCanSend: {
                type: Boolean,
                default: false
            }
        },

        // Most recent message in this conversation
        message: [{
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null
        }],

        // Unique canonical key for personal chats
        personalKey: {
            type: String,
            default: null
        },

        // Used by temporary rooms in a future phase
        expiresAt: {
            type: Date,
            default: null
        },

        // Allows conversations to be deactivated
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);
