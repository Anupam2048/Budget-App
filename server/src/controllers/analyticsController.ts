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

// Get AI-Powered Insights
export const getInsights = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Get current month data
        const [currentIncome, currentExpense, currentExpensesByCategory] = await Promise.all([
            prisma.income.aggregate({
                where: {
                    userId,
                    date: { gte: currentMonth, lte: currentMonthEnd }
                },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: currentMonth, lte: currentMonthEnd }
                },
                _sum: { amount: true }
            }),
            prisma.expense.groupBy({
                by: ['category'],
                where: {
                    userId,
                    date: { gte: currentMonth, lte: currentMonthEnd }
                },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } }
            })
        ]);

        // Get previous month data
        const [previousIncome, previousExpense] = await Promise.all([
            prisma.income.aggregate({
                where: {
                    userId,
                    date: { gte: previousMonth, lte: previousMonthEnd }
                },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: previousMonth, lte: previousMonthEnd }
                },
                _sum: { amount: true }
            })
        ]);

        const currentIncomeTotal = currentIncome._sum.amount || 0;
        const currentExpenseTotal = currentExpense._sum.amount || 0;
        const previousIncomeTotal = previousIncome._sum.amount || 0;
        const previousExpenseTotal = previousExpense._sum.amount || 0;

        const currentSavings = currentIncomeTotal - currentExpenseTotal;
        const previousSavings = previousIncomeTotal - previousExpenseTotal;

        const insights: Array<{ type: string; message: string; icon: string }> = [];

        // Insight 1: Month-over-month spending comparison
        if (previousExpenseTotal > 0) {
            const expenseChange = ((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) * 100;
            if (Math.abs(expenseChange) > 5) {
                const direction = expenseChange > 0 ? 'more' : 'less';
                const icon = expenseChange > 0 ? 'alert' : 'success';
                insights.push({
                    type: icon,
                    message: `You spent ${Math.abs(expenseChange).toFixed(1)}% ${direction} this month compared to last month`,
                    icon: expenseChange > 0 ? 'TrendingUp' : 'TrendingDown'
                });
            }
        }

        // Insight 2: Savings comparison
        if (previousSavings !== 0) {
            const savingsDiff = currentSavings - previousSavings;
            if (Math.abs(savingsDiff) > 100) {
                const direction = savingsDiff > 0 ? 'increased' : 'dropped';
                const icon = savingsDiff > 0 ? 'success' : 'warning';
                insights.push({
                    type: icon,
                    message: `Savings ${direction} by ₹${Math.abs(savingsDiff).toFixed(0)} compared to last month`,
                    icon: savingsDiff > 0 ? 'TrendingUp' : 'TrendingDown'
                });
            }
        }

        // Insight 3: Top spending categories
        if (currentExpensesByCategory.length > 0) {
            const topCategories = currentExpensesByCategory.slice(0, 3);
            const topCategoryNames = topCategories.map(c => c.category).join(', ');
            insights.push({
                type: 'info',
                message: `Top spending categories: ${topCategoryNames}`,
                icon: 'PieChart'
            });
        }

        // Insight 4: Savings rate
        if (currentIncomeTotal > 0) {
            const savingsRate = (currentSavings / currentIncomeTotal) * 100;
            if (savingsRate < 0) {
                insights.push({
                    type: 'alert',
                    message: `You're spending more than you earn this month. Consider cutting unnecessary expenses`,
                    icon: 'AlertTriangle'
                });
            } else if (savingsRate < 20) {
                insights.push({
                    type: 'warning',
                    message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income`,
                    icon: 'Target'
                });
            } else {
                insights.push({
                    type: 'success',
                    message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income`,
                    icon: 'ThumbsUp'
                });
            }
        }

        // Insight 5: Budget alerts (if budgets exist)
        const budgets = await prisma.budget.findMany({
            where: {
                userId,
                monthYear: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            }
        });

        for (const budget of budgets) {
            const categoryExpense = currentExpensesByCategory.find(e => e.category === budget.category);
            const spent = categoryExpense?._sum.amount || 0;
            const percentage = (spent / budget.amount) * 100;

            if (percentage >= 100) {
                insights.push({
                    type: 'alert',
                    message: `You've exceeded your ${budget.category} budget by ₹${(spent - budget.amount).toFixed(0)}`,
                    icon: 'AlertCircle'
                });
            } else if (percentage >= 80) {
                insights.push({
                    type: 'warning',
                    message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
                    icon: 'AlertTriangle'
                });
            }
        }

        res.json({
            insights,
            summary: {
                currentMonth: {
                    income: currentIncomeTotal,
                    expense: currentExpenseTotal,
                    savings: currentSavings
                },
                previousMonth: {
                    income: previousIncomeTotal,
                    expense: previousExpenseTotal,
                    savings: previousSavings
                }
            }
        });

    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ message: 'Error generating insights' });
    }
};

