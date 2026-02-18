import { Router } from 'express';
import { confirmEnrollment, getMyEnrollments, getEnrollmentReport } from '../controllers/enrollmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/confirm', authenticateToken, requireRole(['ALUMNO']), confirmEnrollment);
router.get('/my', authenticateToken, requireRole(['ALUMNO']), getMyEnrollments);
router.get('/report', authenticateToken, requireRole(['ORGANIZADOR']), getEnrollmentReport);

export default router;
