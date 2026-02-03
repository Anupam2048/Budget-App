import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getAllEMIs,
    getEMIById,
    createEMI,
    updateEMI,
    deleteEMI
} from '../controllers/emiController';

const router = express.Router();

router.get('/', authenticateToken, getAllEMIs);
router.get('/:id', authenticateToken, getEMIById);
router.post('/', authenticateToken, createEMI);
router.put('/:id', authenticateToken, updateEMI);
router.delete('/:id', authenticateToken, deleteEMI);

export default router;
