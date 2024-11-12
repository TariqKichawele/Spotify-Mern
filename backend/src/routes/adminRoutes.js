import express from 'express';
import { protectRoute, requireAdmin } from '../middleware/authMiddleware.js';
import { checkAdmin, createSong, deleteSong, createAlbum, deleteAlbum } from '../controllers/adminControllers.js';

const router = express.Router();

router.use(protectRoute, requireAdmin);

router.get('/check', checkAdmin)

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);


export default router