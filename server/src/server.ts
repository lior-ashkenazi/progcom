import express, { Express, Request, Response } from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import path from "path";

import { Server } from "socket.io";

// Routers
import usersRouter from "./routers/api/usersRouter";
import chatsRouter from "./routers/chatRouter";
import messagesRouter from "./routers/api/messagesRouter";

dotenv.config();

const app: Express = express();

connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use("/api/user", usersRouter);
app.use("/api/chat", chatsRouter);
app.use("/api/message", messagesRouter);

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket are in action");
  socket.on("setup");
});
