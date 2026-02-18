import { Router } from 'express';
import { registerTimeSlot, getMyRegistration } from '../controllers/fairController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/register', authenticateToken, requireRole(['ALUMNO']), registerTimeSlot);
router.get('/my', authenticateToken, requireRole(['ALUMNO']), getMyRegistration);

export default router;
