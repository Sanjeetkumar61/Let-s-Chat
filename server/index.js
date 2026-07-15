import express from "express";
import http from "http";
import "dotenv/config";
import cors from "cors";
import { Server } from "socket.io";
import { setIO } from "./sockets/socket.js";

import connectDb from "./config/db.js";
import { socketHandler } from "./sockets/socketHandler.js";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

connectDb();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173",
      process.env.CLIENT_URL],
    credentials: true,
  },
});

setIO(io);

socketHandler(io);

app.use(
  cors({
    origin: ["http://localhost:5173",
      process.env.CLIENT_URL],
    credentials: true,

  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});