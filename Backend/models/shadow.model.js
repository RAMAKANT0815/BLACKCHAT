import mongoose, {Schema} from "mongoose";

const shadowSchema = new Schema({
    shadow: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shadowing: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

export const Shadow = mongoose.model("Shadow", shadowSchema);