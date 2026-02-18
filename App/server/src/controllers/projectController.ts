import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

// const prisma = new PrismaClient();

export const getAllProjects = async (req: Request, res: Response) => {
    const { period, search } = req.query;

    const where: any = {};
    if (period) where.period = period as string;
    if (search) {
        where.OR = [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
        ];
    }

    // MOCK DATA
    const projects = [
        {
            id: 1,
            name: 'Mock Project A',
            description: 'This is a mock project',
            period: 'FEB-JUN 2026',
            capacity: 10,
            enrolled: 2,
            secretCode: 'SECRET123',
            ownerId: 100,
            owner: { name: 'Dr. Smith' }
        },
        {
            id: 2,
            name: 'Mock Project B',
            description: 'Another mock project',
            period: 'FEB-JUN 2026',
            capacity: 5,
            enrolled: 5,
            secretCode: 'CODE456',
            ownerId: 101,
            owner: { name: 'Prof. Jones' }
        }
    ];

    // Mask secretCode for students
    const userRole = (req as AuthRequest).user?.role;
    const sanitizedProjects = projects.map(p => {
        if (userRole === 'ALUMNO') {
            const { secretCode, ...rest } = p;
            return rest;
        }
        return p;
    });

    res.json(sanitizedProjects);
};

export const createProject = async (req: Request, res: Response) => {
    const { name, description, period, capacity, secretCode } = req.body;
    const userId = (req as AuthRequest).user?.id;

    // If Organizer calls this, they might assign an owner. For simplicity, let's assume Organizer or Partner creates it.

    // MOCK CREATE
    const mockProject = {
        id: Math.floor(Math.random() * 1000),
        name,
        description,
        period,
        capacity: Number(capacity),
        enrolled: 0,
        secretCode,
        ownerId: userId
    };

    console.log('[MOCK] Created project:', mockProject);
    res.json(mockProject);
}
