import { Request, Response } from 'express';
import prisma from '../utils/db';

// --- INCOMES ---
export const getIncomes = async (req: any, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const where: any = { userId: req.user.id };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const [incomes, total] = await Promise.all([
            prisma.income.findMany({
                where,
                take: limit,
                skip,
                orderBy: { date: 'desc' },
            }),
            prisma.income.count({ where }),
        ]);

        res.json({
            incomes,
            total,
            page,
            pages: Math.ceil(total / limit),
            hasMore: skip + incomes.length < total,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching incomes' });
    }
};

export const addIncome = async (req: any, res: Response) => {
    try {
        const { source, amount, date, frequency } = req.body;
        const income = await prisma.income.create({
            data: {
                userId: req.user.id,
                source,
                amount: parseFloat(amount),
                date: new Date(date),
                frequency,
            },
        });
        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Error adding income' });
    }
};

export const deleteIncome = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.income.delete({ where: { id } }); // Add ownership check in real app
        res.json({ message: 'Income deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting income' });
    }
}


export const updateIncome = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { source, amount, date, frequency } = req.body;

        // Check ownership
        const existingIncome = await prisma.income.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existingIncome) {
            return res.status(404).json({ message: 'Income not found' });
        }

        const income = await prisma.income.update({
            where: { id },
            data: {
                source,
                amount: parseFloat(amount),
                date: new Date(date),
                frequency
            }
        });
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Error updating income' });
    }
};


// --- EXPENSES ---
export const getExpenses = async (req: any, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;
        const category = req.query.category as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        // Build where clause
        const where: any = { userId: req.user.id };

        if (category) {
            where.category = category;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const [expenses, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                take: limit,
                skip,
                orderBy: { date: 'desc' },
            }),
            prisma.expense.count({ where }),
        ]);

        res.json({
            expenses,
            total,
            page,
            pages: Math.ceil(total / limit),
            hasMore: skip + expenses.length < total,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses' });
    }
};

export const createExpense = async (req: any, res: Response) => {
    try {
        const { category, amount, date, paymentMethod, notes } = req.body;

        // Validate amount
        if (!amount || amount <= 0 || amount > 10000000) {
            return res.status(400).json({
                message: 'Amount must be between 0.01 and 10,000,000'
            });
        }

        // Validate required fields
        if (!category || !date) {
            return res.status(400).json({ message: 'Category and date are required' });
        }

        const expense = await prisma.expense.create({
            data: {
                userId: req.user.id,
                category,
                amount: parseFloat(amount),
                date: new Date(date),
                notes,
                paymentMethod
            },
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense' });
    }
};

export const deleteExpense = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({ where: { id } });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense' });
    }
}


export const updateExpense = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { category, amount, date, paymentMethod, notes } = req.body;

        // Check ownership
        const existingExpense = await prisma.expense.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!existingExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Validate amount if present
        if (amount && (amount <= 0 || amount > 10000000)) {
            return res.status(400).json({
                message: 'Amount must be between 0.01 and 10,000,000'
            });
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                ...(category && { category }),
                ...(amount && { amount: parseFloat(amount) }),
                ...(date && { date: new Date(date) }),
                ...(notes !== undefined && { notes }),
                ...(paymentMethod && { paymentMethod })
            }
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense' });
    }
};
