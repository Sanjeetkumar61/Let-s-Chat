import express from "express";
import http from "http";
import "dotenv/config";
import cors from "cors";
import { Server } from "socket.io";

import connectDb from "./config/db.js";
import { socketHandler } from "./sockets/socketHandler.js";
import { setIO } from "./sockets/socket.js";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

connectDb();

const server = http.createServer(app);

// Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setIO(io);
socketHandler(io);

// Express Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});