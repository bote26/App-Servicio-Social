import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // MOCK LOGIN - Accepts any email/password
    try {
        console.log(`[MOCK] Login attempt for: ${email}`);

        const mockUser = {
            id: 1,
            email: email || 'test@example.com',
            name: 'Test User',
            role: 'ALUMNO', // Default role for testing
            passwordHash: 'mock_hash'
        };

        const token = jwt.sign(
            { id: mockUser.id, email: mockUser.email, role: mockUser.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: mockUser.id, name: mockUser.name, email: mockUser.email, role: mockUser.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
