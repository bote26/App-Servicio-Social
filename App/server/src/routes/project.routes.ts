import { Router } from 'express';
import { getAllProjects, createProject } from '../controllers/projectController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllProjects);
router.post('/', authenticateToken, requireRole(['ORGANIZADOR', 'SOCIOFORMADOR']), createProject);

export default router;
