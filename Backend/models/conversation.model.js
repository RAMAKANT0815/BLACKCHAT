import mongoose from mongoose
import { Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                "private",
                "group",
                "community",
                "temporary"
            ],
            required: true
        },

        name: {
            type: String,
            default: ""
        },

        image: {
            url: {
                type: String,
                default: ""
            },
            public_id: {
                type: String,
                default: ""
            }
        },

        description: {
            type: String,
            default: ""
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        deletedAt: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                },
                at: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        onlyAdminsCanSend: {
            type: Boolean,
            default: false
        },

        startTime: {
            type: Date,
            default: null
        },

        endTime: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const Conversation = mongoose.model("Conversation", conversationSchema)