import express from 'express';
import { protectRoute, requireAdmin } from '../middleware/authMiddleware.js';
import { 
    getAllSongs, 
    getFeaturedSongs, 
    getMadeForYouSongs, 
    getTrendingSongs 
} from '../controllers/songControllers.js';

const router = express.Router();

router.get('/', protectRoute, requireAdmin, getAllSongs);
router.get('/featured', getFeaturedSongs);
router.get('/made-for-you', getMadeForYouSongs);
router.get('/trending', getTrendingSongs);

export default router