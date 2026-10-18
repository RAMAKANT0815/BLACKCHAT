import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import { User } from "./models/user.model.js";

dotenv.config({ path: "./.env" });

console.log("FRONTEND_URL =", process.env.FRONTEND_URL);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = http.createServer(app);

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

// Make Socket.IO accessible in controllers
app.set("io", io);

// Authenticate socket connections using the access-token cookie
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || "";

        const tokenCookie = cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("accessToken="));

        if (!tokenCookie) {
            return next(new Error("Authentication required"));
        }

        const token = decodeURIComponent(
            tokenCookie.substring("accessToken=".length)
        );

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id).select("_id");

        if (!user) {
            return next(new Error("Invalid access token"));
        }

        // Set identity only from the verified JWT
        socket.userId = user._id.toString();

        next();
    } catch (error) {
        console.error("Socket authentication failed:", error.message);
        next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    console.log(
        "⚡ Authenticated user connected:",
        socket.userId,
        "Socket:",
        socket.id
    );

    // Join the authenticated user's private room
    socket.join(socket.userId);

    // Existing post socket handlers
    socket.on("joinPost", (postId) => {
        if (typeof postId === "string" && postId) {
            socket.join(postId);
        }
    });

    socket.on("leavePost", (postId) => {
        if (typeof postId === "string" && postId) {
            socket.leave(postId);
        }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.userId,
            "Socket:",
            socket.id
        );
    });
});

connectDB()
    .then(() => {
        server.listen(
            process.env.PORT || 8000,
            () => {
                console.log(
                    `Server is running on port ${process.env.PORT || 8000}`
                );
            }
        );
    })
    .catch((error) => {
        console.error("Error while connecting to DB:", error);
        process.exit(1);
    });