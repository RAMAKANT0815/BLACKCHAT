import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const cleanupTemporaryChats = async () => {
    try {
        const expiredConversations = await Conversation.find({
            type: "temporary",
            endTime: { $lte: new Date() }
        }).select("_id");

        for (const conversation of expiredConversations) {

            await Message.deleteMany({
                conversation: conversation._id
            });

            await Conversation.deleteOne({
                _id: conversation._id
            });
        }

        console.log(
            `Temporary chat cleanup completed. Deleted ${expiredConversations.length} chats.`
        );

    } catch (error) {
        console.log(
            "Temporary chat cleanup error:",
            error.message
        );
    }
};