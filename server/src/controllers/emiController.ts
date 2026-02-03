import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all EMIs for a user
export const getAllEMIs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const emis = await prisma.eMI.findMany({
            where: { userId },
            orderBy: { dueDate: 'asc' }
        });

        res.json(emis);
    } catch (error) {
        console.error('Error fetching EMIs:', error);
        res.status(500).json({ message: 'Failed to fetch EMIs' });
    }
};

// Get single EMI
export const getEMIById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).userId;

        const emi = await prisma.eMI.findFirst({
            where: { id, userId }
        });

        if (!emi) {
            return res.status(404).json({ message: 'EMI not found' });
        }

        res.json(emi);
    } catch (error) {
        console.error('Error fetching EMI:', error);
        res.status(500).json({ message: 'Failed to fetch EMI' });
    }
};

// Create new EMI
export const createEMI = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { name, amount, totalAmount, dueDate, startDate, endDate } = req.body;

        // Validation
        if (!name || !amount || !dueDate || !startDate) {
            return res.status(400).json({
                message: 'Name, amount, due date, and start date are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        if (dueDate < 1 || dueDate > 31) {
            return res.status(400).json({ message: 'Due date must be between 1 and 31' });
        }

        const emi = await prisma.eMI.create({
            data: {
                userId,
                name,
                amount: parseFloat(amount),
                totalAmount: totalAmount ? parseFloat(totalAmount) : null,
                dueDate: parseInt(dueDate),
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                isActive: true
            }
        });

        res.status(201).json(emi);
    } catch (error) {
        console.error('Error creating EMI:', error);
        res.status(500).json({ message: 'Failed to create EMI' });
    }
};

// Update EMI
export const updateEMI = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).userId;
        const { name, amount, totalAmount, dueDate, startDate, endDate, isActive } = req.body;

        // Check if EMI exists and belongs to user
        const existingEMI = await prisma.eMI.findFirst({
            where: { id, userId }
        });

        if (!existingEMI) {
            return res.status(404).json({ message: 'EMI not found' });
        }

        // Validation
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        if (dueDate !== undefined && (dueDate < 1 || dueDate > 31)) {
            return res.status(400).json({ message: 'Due date must be between 1 and 31' });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (totalAmount !== undefined) updateData.totalAmount = totalAmount ? parseFloat(totalAmount) : null;
        if (dueDate !== undefined) updateData.dueDate = parseInt(dueDate);
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const emi = await prisma.eMI.update({
            where: { id },
            data: updateData
        });

        res.json(emi);
    } catch (error) {
        console.error('Error updating EMI:', error);
        res.status(500).json({ message: 'Failed to update EMI' });
    }
};

// Delete EMI
export const deleteEMI = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).userId;

        // Check if EMI exists and belongs to user
        const existingEMI = await prisma.eMI.findFirst({
            where: { id, userId }
        });

        if (!existingEMI) {
            return res.status(404).json({ message: 'EMI not found' });
        }

        await prisma.eMI.delete({
            where: { id }
        });

        res.json({ message: 'EMI deleted successfully' });
    } catch (error) {
        console.error('Error deleting EMI:', error);
        res.status(500).json({ message: 'Failed to delete EMI' });
    }
};
