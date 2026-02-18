import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import fairRoutes from './routes/fair.routes';

dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/fair', fairRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app }; // , prisma };
