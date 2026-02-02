import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { downloadReport } from '../controllers/reportsController';

const router = Router();

router.get('/download', authenticateToken, downloadReport);

export default router;
