import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log(process.env.MONGODB_URL);

        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URL
        );

        console.log(
            `\n mongoDb connected Host : ${connectionInstance.connection.host}`
        );

    } catch (error) {
        console.log("mongodb connection error", error);
        process.exit(1);
    }
};

export default connectDB;

