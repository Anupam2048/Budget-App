import { Request, Response } from 'express';
import prisma from '../utils/db';

// --- BUDGETS ---
export const getBudgets = async (req: any, res: Response) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId: req.user.id },
        });

        // Calculate spent amount for each budget category for the specific month
        // This is a simplified logic. Real logic would filter expenses by date matching the budget month.
        const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
            const expenses = await prisma.expense.groupBy({
                by: ['category'],
                where: {
                    userId: req.user.id,
                    category: budget.category,
                    // Add date filtering here ideally
                },
                _sum: {
                    amount: true
                }
            });

            return {
                ...budget,
                spent: expenses[0]?._sum.amount || 0
            };
        }));

        res.json(budgetsWithSpent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching budgets' });
    }
};

export const addBudget = async (req: any, res: Response) => {
    try {
        const { category, amount, monthYear } = req.body;
        const budget = await prisma.budget.create({
            data: {
                userId: req.user.id,
                category,
                amount: parseFloat(amount),
                monthYear, // "2023-10"
            },
        });
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error adding budget' });
    }
};

// --- GOALS ---
export const getGoals = async (req: any, res: Response) => {
    try {
        const goals = await prisma.savingsGoal.findMany({
            where: { userId: req.user.id },
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching goals' });
    }
};

export const addGoal = async (req: any, res: Response) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        const goal = await prisma.savingsGoal.create({
            data: {
                userId: req.user.id,
                name,
                targetAmount: parseFloat(targetAmount),
                deadline: new Date(deadline),
                currentAmount: 0 // Start with 0
            },
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error adding goal' });
    }
};
