import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

// const prisma = new PrismaClient();

export const confirmEnrollment = async (req: Request, res: Response) => {
    const { projectId, validationCode } = req.body;
    const userId = (req as AuthRequest).user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // MOCK ENROLLMENT
    console.log(`[MOCK] Enrolling user ${userId} in project ${projectId}`);

    // Simulate checks
    if (validationCode !== 'SECRET123' && validationCode !== 'CODE456') {
        return res.status(400).json({ error: 'Invalid validation code' });
    }

    const mockEnrollment = {
        id: Math.floor(Math.random() * 1000),
        userId,
        projectId,
        period: 'FEB-JUN 2026',
        folio: 'MOCK-FOLIO-123',
        createdAt: new Date()
    };

    res.json(mockEnrollment);
};

export const getMyEnrollments = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // MOCK GET MY ENROLLMENTS
    const enrollments = [
        {
            id: 1,
            userId,
            projectId: 1,
            period: 'FEB-JUN 2026',
            folio: 'MOCK-FOLIO-001',
            createdAt: new Date(),
            project: {
                id: 1,
                name: 'Mock Project A',
                description: 'This is a mock project'
            }
        }
    ];
    res.json(enrollments);
};

export const getEnrollmentReport = async (req: Request, res: Response) => {
    // For Organizer to download full report
    try {
        // MOCK REPORT
        const report = [
            {
                id: 1,
                user: { name: 'Test User', matricula: 'A01234567', email: 'test@example.com' },
                project: { name: 'Mock Project A', period: 'FEB-JUN 2026' }
            }
        ];
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch report" });
    }
};
