import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

import {
  sendMessage,
  getMessages,
  markAsDelivered,
  markAsRead,
  downloadFile,
  openFile,
  deleteForMe,
  deleteForEveryone,
  getUnreadCounts,
} from "../controllers/messageController.js";

const router = Router();

// Send Message
router.post(
  "/send/:receiverId",
  authMiddleware,
  upload.single("file"),
  sendMessage
);

// Get Unread Counts (Keep this ABOVE /:receiverId)
router.get(
  "/unread/counts",
  authMiddleware,
  getUnreadCounts
);

// Get Chat Messages
router.get(
  "/:receiverId",
  authMiddleware,
  getMessages
);

// Delivery Status
router.put(
  "/delivered/:messageId",
  authMiddleware,
  markAsDelivered
);

// Read Status
router.put(
  "/read/:messageId",
  authMiddleware,
  markAsRead
);

// Download File
router.get(
  "/download/:messageId",
  authMiddleware,
  downloadFile
);

// Open File
router.get(
  "/open/:messageId",
  authMiddleware,
  openFile
);

// Delete for Me
router.delete(
  "/delete/me/:messageId",
  authMiddleware,
  deleteForMe
);

// Delete for Everyone
router.delete(
  "/delete/everyone/:messageId",
  authMiddleware,
  deleteForEveryone
);

export default router;