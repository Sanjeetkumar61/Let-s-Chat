import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  markAsDelivered,
  markAsRead,
  downloadFile,
  openFile,
  deleteForMe,
  deleteForEveryone,
} from "../controllers/messageController.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.post(
  "/send/:receiverId",
  authMiddleware,
  upload.single("file"),
  sendMessage
);

router.get("/:receiverId", authMiddleware, getMessages);

router.put("/delivered/:messageId", authMiddleware, markAsDelivered);

router.put("/read/:messageId", authMiddleware, markAsRead);

router.get("/download/:messageId", authMiddleware, downloadFile);

router.get(
  "/open/:messageId",
  authMiddleware,
  openFile
);

router.delete(
  "/delete/me/:messageId",
  authMiddleware,
  deleteForMe
);

router.delete(
  "/delete/everyone/:messageId",
  authMiddleware,
  deleteForEveryone
);

export default router;