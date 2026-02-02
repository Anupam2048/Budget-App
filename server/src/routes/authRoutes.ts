import { Router } from 'express';
import { signup, login, getMe, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { loginLimiter, signupLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/signup', signupLimiter, signup);
router.post('/login', loginLimiter, login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;
