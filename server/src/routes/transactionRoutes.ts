import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getIncomes, addIncome, deleteIncome, getExpenses, createExpense, deleteExpense } from '../controllers/transactionController';

const router = Router();

// Incomes
router.get('/incomes', authenticateToken, getIncomes);
router.post('/incomes', authenticateToken, addIncome);
router.delete('/incomes/:id', authenticateToken, deleteIncome);

// Expenses
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, createExpense);
router.delete('/expenses/:id', authenticateToken, deleteExpense);

export default router;
