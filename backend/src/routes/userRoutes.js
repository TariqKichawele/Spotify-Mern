import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getAllUsers, getMessages } from "../controllers/userControllers.js";

const router = express.Router();

router.get('/', protectRoute, getAllUsers);
router.get('/messages/:userId', protectRoute, getMessages);

export default router