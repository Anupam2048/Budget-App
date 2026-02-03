import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getIncomes, addIncome, deleteIncome, updateIncome, getExpenses, createExpense, deleteExpense, updateExpense } from '../controllers/transactionController';

const router = Router();

// Incomes
router.get('/incomes', authenticateToken, getIncomes);
router.post('/incomes', authenticateToken, addIncome);
router.put('/incomes/:id', authenticateToken, updateIncome);
router.delete('/incomes/:id', authenticateToken, deleteIncome);

// Expenses
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, createExpense);
router.put('/expenses/:id', authenticateToken, updateExpense);
router.delete('/expenses/:id', authenticateToken, deleteExpense);

export default router;
