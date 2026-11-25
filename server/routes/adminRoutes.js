import { Router } from 'express';
import { activities, stats, users } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(protect, requireAdmin);
router.get('/stats', stats);
router.get('/users', users);
router.get('/activities', activities);
export default router;
