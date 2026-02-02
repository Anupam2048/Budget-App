import { Request, Response } from 'express';
import prisma from '../utils/db';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};

// Interceptor for handling 401 errors (token expiry)
// Add this to client/src/lib/api.ts:
/*
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);
*/
