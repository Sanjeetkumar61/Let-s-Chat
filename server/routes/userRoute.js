import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile, getUsers } from "../controllers/userController.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);

router.get("/", authMiddleware, getUsers);

export default router;