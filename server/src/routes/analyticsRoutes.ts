import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getDashboardAnalytics, getReportsAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardAnalytics);
router.get('/reports', authenticateToken, getReportsAnalytics);

export default router;
