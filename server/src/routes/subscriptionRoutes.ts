import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getAllSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription
} from '../controllers/subscriptionController';

const router = express.Router();

router.get('/', authenticateToken, getAllSubscriptions);
router.get('/:id', authenticateToken, getSubscriptionById);
router.post('/', authenticateToken, createSubscription);
router.put('/:id', authenticateToken, updateSubscription);
router.delete('/:id', authenticateToken, deleteSubscription);

export default router;
