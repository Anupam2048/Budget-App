import { Request, Response } from 'express';
import prisma from '../utils/db';

export const getDashboardAnalytics = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Totals
        const totalIncome = await prisma.income.aggregate({
            where: { userId },
            _sum: { amount: true },
        });

        const totalExpense = await prisma.expense.aggregate({
            where: { userId },
            _sum: { amount: true },
        });

        // Recent Transactions (Last 5)
        // Union-like query simulation or just fetch separately
        const recentExpenses = await prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 5
        });

        res.json({
            totalIncome: totalIncome._sum.amount || 0,
            totalExpense: totalExpense._sum.amount || 0,
            balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
            recentTransactions: recentExpenses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

export const getReportsAnalytics = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        // Build date filter - use income.date and expense.date (NOT createdAt)
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
            dateFilter.gte.setHours(0, 0, 0, 0); // Start of day
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
            dateFilter.lte.setHours(23, 59, 59, 999); // End of day
        }

        // Build where clause
        const incomeWhere: any = { userId };
        const expenseWhere: any = { userId };

        if (startDate || endDate) {
            incomeWhere.date = dateFilter;
            expenseWhere.date = dateFilter;
        }

        // Aggregate totals (same logic as Dashboard)
        const [totalIncome, totalExpense, expensesByCategory, incomes, expenses] = await Promise.all([
            prisma.income.aggregate({
                where: incomeWhere,
                _sum: { amount: true },
            }),
            prisma.expense.aggregate({
                where: expenseWhere,
                _sum: { amount: true },
            }),
            // Group expenses by category
            prisma.expense.groupBy({
                by: ['category'],
                where: expenseWhere,
                _sum: { amount: true },
            }),
            // Get all incomes for trend analysis
            prisma.income.findMany({
                where: incomeWhere,
                select: { amount: true, date: true },
                orderBy: { date: 'asc' },
            }),
            // Get all expenses for trend analysis
            prisma.expense.findMany({
                where: expenseWhere,
                select: { amount: true, date: true },
                orderBy: { date: 'asc' },
            }),
        ]);

        const incomeTotal = totalIncome._sum.amount || 0;
        const expenseTotal = totalExpense._sum.amount || 0;
        const balance = incomeTotal - expenseTotal;

        // Format expense by category
        const expenseByCategory = expensesByCategory.map(item => ({
            category: item.category,
            amount: item._sum.amount || 0,
        }));

        // Generate monthly trend data
        const monthlyTrends = generateMonthlyTrends(incomes, expenses);

        res.json({
            totalIncome: incomeTotal,
            totalExpense: expenseTotal,
            balance,
            expenseByCategory,
            incomeVsExpenseTrend: monthlyTrends,
            period: {
                start: startDate || 'all-time',
                end: endDate || 'all-time',
            },
        });

    } catch (error) {
        console.error('Reports Analytics Error:', error);
        res.status(500).json({ message: 'Error fetching reports analytics' });
    }
};

// Helper function to generate monthly trend data
function generateMonthlyTrends(
    incomes: { amount: number; date: Date }[],
    expenses: { amount: number; date: Date }[]
) {
    const monthMap = new Map<string, { income: number; expense: number }>();

    // Aggregate incomes by month
    incomes.forEach(income => {
        const date = new Date(income.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthMap.get(monthKey) || { income: 0, expense: 0 };
        existing.income += income.amount;
        monthMap.set(monthKey, existing);
    });

    // Aggregate expenses by month
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthMap.get(monthKey) || { income: 0, expense: 0 };
        existing.expense += expense.amount;
        monthMap.set(monthKey, existing);
    });

    // Convert to array and sort by month
    const trends = Array.from(monthMap.entries())
        .map(([month, data]) => ({
            name: formatMonthName(month),
            month,
            income: data.income,
            expense: data.expense,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return trends;
}

// Helper to format month name (e.g., "2024-01" -> "Jan 2024")
function formatMonthName(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
}
