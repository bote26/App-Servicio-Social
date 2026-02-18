import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

// const prisma = new PrismaClient();

export const registerTimeSlot = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    const { timeSlot } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Basic slot capacity check could go here if we tracked slot counts separately
    // For now, adhering to the logical requirement of unique user registration

    // MOCK REGISTRATION
    console.log(`[MOCK] Registering user ${userId} for time slot ${timeSlot}`);
    res.json({ id: 123, userId, timeSlot, createdAt: new Date() });
};

export const getMyRegistration = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // MOCK GET REGISTRATION
    const reg = {
        id: 123,
        userId,
        timeSlot: '10:00',
        createdAt: new Date()
    };
    res.json(reg);
}
