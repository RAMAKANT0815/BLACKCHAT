import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import { User } from "./models/user.model.js";
import cron from "node-cron";
import { cleanupTemporaryChats } from "./utils/cleanupTemporaryChats.js";

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

// Make io accessible globally in controllers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // --- EXISTING POST SOCKET HANDLERS ---
    socket.on("joinPost", (postId) => {
        socket.join(postId);
    });

    socket.on("leavePost", (postId) => {
        socket.leave(postId);
    });

    // --- NEW CHAT & PRESENCE SOCKET HANDLERS ---
    
    // 1. User setup & online status
    socket.on("setup_user", async (userId) => {
        if (!userId) return;
        socket.join(userId);
        socket.userId = userId;

        // Mark user as online in database
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("user_status_changed", { userId, isOnline: true });
    });

    // 2. Join specific chat room channel
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined chat room: ${roomId}`);
    });

    // 3. Leave chat room channel
    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left chat room: ${roomId}`);
    });

    // 4. Real-time message broadcast
    socket.on("send_message", (newMessage) => {
        const roomId = newMessage.room;
        if (!roomId) return;

        // Broadcast to all clients in the room except sender
        socket.to(roomId).emit("message_received", newMessage);
    });

    // 5. Typing indicators
    socket.on("typing", (roomId) => socket.to(roomId).emit("typing", roomId));
    socket.on("stop_typing", (roomId) => socket.to(roomId).emit("stop_typing", roomId));

    // --- DISCONNECT HANDLER ---
    socket.on("disconnect", async () => {
        console.log("🔥 User disconnected:", socket.id);

        if (socket.userId) {
            const lastSeenDate = new Date();
            await User.findByIdAndUpdate(socket.userId, {
                isOnline: false,
                lastSeen: lastSeenDate
            });

            io.emit("user_status_changed", {
                userId: socket.userId,
                isOnline: false,
                lastSeen: lastSeenDate
            });
        }
    });
});

connectDB()
    .then(() => {
        cron.schedule("0 2 * * *", async () => {
            console.log("🧹 Running temporary chat cleanup...");

            await cleanupTemporaryChats();
        });
        server.listen(
            process.env.PORT || 8000,
            () => {
                console.log(
                    `Server is running on port ${process.env.PORT || 8000}`
                );
            }
        );
    })
    .catch((e) => {
        console.log("Error while connecting to db", e);
        process.exit(1);
    });

