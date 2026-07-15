import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

import {
  createGroup,
  getUserGroups,
  getGroupById,
  sendGroupMessage,
} from "../controllers/groupController.js";

import { getGroupMessages } from "../controllers/messageController.js";

const router = Router();

router.post("/create", authMiddleware, createGroup);

router.get("/", authMiddleware, getUserGroups);

router.get("/:groupId", authMiddleware, getGroupById);


router.post(
  "/:groupId/message",
  authMiddleware,
  upload.single("file"),
  sendGroupMessage
);

router.get(
  "/:groupId/messages",
  authMiddleware,
  getGroupMessages
);

export default router;