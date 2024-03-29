import express, { Express } from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import { Server } from "socket.io";

// Interfaces
import { IUser } from "./models/userModel";

// Error handling
import { errorHandler, notFound } from "./middleware/errorMiddleware";

// Routes
import usersRouter from "./routes/usersRoutes";
import authRouter from "./routes/authRoutes";
import profileRouter from "./routes/profileRoutes";
import chatsRouter from "./routes/chatsRoutes";
import messagesRouter from "./routes/messagesRoutes";

dotenv.config();

const app: Express = express();

connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/messages", messagesRouter);

const __dirname$ = path.resolve();
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname$, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname$, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "ProgCom server has been rolled up",
    });
  });
}

const PORT = process.env.PORT || 5000;

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("SOCKET IS IN ACTION");

  // Setup on
  socket.on("setup", (user: IUser) => {
    socket.join(user._id);
    console.log(user.userName, " CONNECTED");
    socket.emit("CONNECTED");
  });

  // Join chat
  socket.on("access chat", (chat) => {
    socket.join(chat._id);
    console.log(`USER ACCESSED CHAT ${chat._id}`);
  });

  // Send new message
  socket.on("new message", (chat, newMessage) => {
    // newMessage is a IMessage that is populated
    // so newMessage.chat is well defined
    chat.participants.forEach((user: IUser) => {
      io.to(user._id).emit("message received", newMessage);
    });
  });

  // Start typing
  socket.on("typing", (chat, user) => {
    io.to(chat._id).emit("typing", user);
  });

  // Stop typing
  socket.on("stop typing", (chat, user) => {
    io.to(chat._id).emit("stop typing", user);
  });

  // Updated group chat
  socket.on("updated group chat", (updatedGroupChat) => {
    updatedGroupChat.participants.forEach((user: IUser) => {
      io.to(user._id).emit("updated group chat", updatedGroupChat);
    });
  });

  // Admin removal
  socket.on("admin removal", (chat, removedUser) => {
    chat.participants.forEach((user: IUser) => {
      io.to(user._id).emit("admin removal", chat, removedUser);
    });
  });

  // Leave chat
  socket.on("leave chat", (chat) => {
    socket.leave(chat._id);
    console.log(`USER LEFT CHAT ${chat._id}`);
  });

  socket.off("setup", (user) => {
    console.log("USER DISCONNECTED");
    socket.leave(user._id);
  });
});
