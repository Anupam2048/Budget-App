import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getDashboardAnalytics, getReportsAnalytics, getInsights } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardAnalytics);
router.get('/reports', authenticateToken, getReportsAnalytics);
router.get('/insights', authenticateToken, getInsights);

export default router;
