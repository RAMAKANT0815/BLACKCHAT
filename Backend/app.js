import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import postRouter from "./routes/post.router.js";
import userRouter from "./routes/user.router.js";
import shadowRouter from "./routes/shadow.router.js";
import likesRouter from "./routes/like.router.js";
import commentRouter from "./routes/comment.router.js";
import roomRouter from "./routes/room.router.js";
import messageRouter from "./routes/message.router.js";
import conversationRouter from "./routes/conversation.router.js"



const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true 
}));

app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));

app.use("/public", express.static("public"));


//routes
app.use("/api/v1", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likesRouter);
app.use("/api/v1/shadow", shadowRouter);     
app.use("/api/v1/messages", messageRouter);  
app.use("/api/v1/conversation", conversationRouter);

export { app };