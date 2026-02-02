import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getBudgets, addBudget, getGoals, addGoal } from '../controllers/budgetController';

const router = Router();

router.get('/budgets', authenticateToken, getBudgets);
router.post('/budgets', authenticateToken, addBudget);

router.get('/goals', authenticateToken, getGoals);
router.post('/goals', authenticateToken, addGoal);

export default router;
