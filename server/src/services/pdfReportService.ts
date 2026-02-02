import PDFDocument from 'pdfkit';
import prisma from '../utils/db';

interface ReportData {
    userId: string;
    userName: string;
    currency: string;
    startDate?: string;
    endDate?: string;
}

export async function generateFinancialReport(data: ReportData): Promise<typeof PDFDocument> {
    const { userId, userName, currency, startDate, endDate } = data;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
        dateFilter.gte = new Date(startDate);
        dateFilter.gte.setHours(0, 0, 0, 0);
    }
    if (endDate) {
        dateFilter.lte = new Date(endDate);
        dateFilter.lte.setHours(23, 59, 59, 999);
    }

    const incomeWhere: any = { userId };
    const expenseWhere: any = { userId };

    if (startDate || endDate) {
        incomeWhere.date = dateFilter;
        expenseWhere.date = dateFilter;
    }

    // Fetch all data
    const [totalIncome, totalExpense, incomes, expenses, budgets, user] = await Promise.all([
        prisma.income.aggregate({ where: incomeWhere, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
        prisma.income.findMany({ where: incomeWhere, orderBy: { date: 'desc' } }),
        prisma.expense.findMany({ where: expenseWhere, orderBy: { date: 'desc' } }),
        prisma.budget.findMany({ where: { userId } }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, currency: true } }),
    ]);

    const incomeTotal = totalIncome._sum.amount || 0;
    const expenseTotal = totalExpense._sum.amount || 0;
    const balance = incomeTotal - expenseTotal;
    const savingsRate = incomeTotal > 0 ? ((balance / incomeTotal) * 100).toFixed(1) : '0';

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Helper functions
    const formatCurrency = (amount: number) => `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    // === COVER PAGE ===
    doc.fontSize(28).font('Helvetica-Bold').text('Personal Budget Planner', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#2563eb').text('Financial Summary Report', { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica');
    doc.text(`Prepared for: ${userName || user?.name || 'User'}`, { align: 'center' });
    doc.moveDown(0.5);

    const dateRangeText = startDate && endDate
        ? `${formatDate(new Date(startDate))} to ${formatDate(new Date(endDate))}`
        : 'All Time';
    doc.text(`Report Period: ${dateRangeText}`, { align: 'center' });
    doc.moveDown(0.5);

    const now = new Date();
    doc.text(`Generated on: ${now.toLocaleDateString('en-IN')} at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, { align: 'center' });

    doc.moveDown(3);
    doc.addPage();

    // === EXECUTIVE SUMMARY ===
    doc.fontSize(18).font('Helvetica-Bold').text('Executive Summary');
    doc.moveDown();

    doc.fontSize(11).font('Helvetica');
    const summaryY = doc.y;
    doc.text(`Total Income:`, 100, summaryY);
    doc.text(formatCurrency(incomeTotal), 300, summaryY, { align: 'right' });

    doc.text(`Total Expenses:`, 100, doc.y + 5);
    doc.text(formatCurrency(expenseTotal), 300, doc.y, { align: 'right' });

    doc.text(`Net Balance:`, 100, doc.y + 5);
    doc.fillColor(balance >= 0 ? '#16a34a' : '#dc2626')
        .text(formatCurrency(balance), 300, doc.y, { align: 'right' })
        .fillColor('black');

    doc.text(`Savings Rate:`, 100, doc.y + 5);
    doc.text(`${savingsRate}%`, 300, doc.y, { align: 'right' });

    doc.moveDown(2);
    const spendingPercent = incomeTotal > 0 ? ((expenseTotal / incomeTotal) * 100).toFixed(0) : '0';
    doc.fontSize(10).font('Helvetica-Oblique')
        .text(`💡 Summary: You spent ${spendingPercent}% of your income during this period.`);

    doc.font('Helvetica').moveDown(2);

    // === INCOME ANALYSIS ===
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Income Analysis');
    doc.moveDown();

    if (incomes.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No income records for this period.');
    } else {
        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        const tableTop = doc.y;
        doc.text('Date', 50, tableTop);
        doc.text('Source', 150, tableTop);
        doc.text('Amount', 400, tableTop, { align: 'right' });

        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown();

        // Table rows
        doc.font('Helvetica').fontSize(9);
        incomes.forEach((income) => {
            if (doc.y > 700) doc.addPage();
            const rowY = doc.y;
            doc.text(formatDate(income.date), 50, rowY, { width: 90 });
            doc.text(income.source, 150, rowY, { width: 240 });
            doc.text(formatCurrency(income.amount), 400, rowY, { align: 'right' });
            doc.moveDown(0.8);
        });

        // Total
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Total Income:', 50);
        doc.text(formatCurrency(incomeTotal), 400, doc.y - 12, { align: 'right' });
    }

    // === EXPENSE ANALYSIS ===
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Expense Analysis');
    doc.moveDown();

    if (expenses.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No expense records for this period.');
    } else {
        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        const tableTop = doc.y;
        doc.text('Date', 50, tableTop);
        doc.text('Category', 120, tableTop);
        doc.text('Amount', 400, tableTop, { align: 'right' });

        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown();

        // Table rows
        doc.font('Helvetica').fontSize(9);
        expenses.forEach((expense) => {
            if (doc.y > 700) doc.addPage();
            const rowY = doc.y;
            doc.text(formatDate(expense.date), 50, rowY, { width: 60 });
            doc.text(expense.category, 120, rowY, { width: 270 });
            doc.text(formatCurrency(expense.amount), 400, rowY, { align: 'right' });
            doc.moveDown(0.8);
        });

        // Total
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Total Expenses:', 50);
        doc.text(formatCurrency(expenseTotal), 400, doc.y - 12, { align: 'right' });

        // Highest spending category
        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (highestCategory) {
            doc.moveDown();
            doc.fontSize(9).font('Helvetica-Oblique');
            doc.text(`📊 Highest spending: ${highestCategory[0]} (${formatCurrency(highestCategory[1])})`);
        }
    }

    // === BUDGET PERFORMANCE ===
    if (budgets.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Budget Performance');
        doc.moveDown(1.5);

        for (const budget of budgets) {
            if (doc.y > 650) doc.addPage();

            // Calculate spent amount for this category
            const categoryExpenses = await prisma.expense.aggregate({
                where: {
                    userId,
                    category: budget.category,
                    ...(startDate || endDate ? { date: dateFilter } : {}),
                },
                _sum: { amount: true },
            });
            const spent = categoryExpenses._sum.amount || 0;
            const remaining = budget.amount - spent;
            const percentUsed = budget.amount > 0 ? ((spent / budget.amount) * 100).toFixed(0) : '0';

            let status = 'Under Budget ✓';
            let statusColor = '#16a34a';
            if (spent > budget.amount) {
                status = 'Over Budget ⚠';
                statusColor = '#dc2626';
            } else if (spent >= budget.amount * 0.9) {
                status = 'Near Limit ⚡';
                statusColor = '#f59e0b';
            }

            doc.fontSize(12).font('Helvetica-Bold').text(budget.category);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Budget Limit: ${formatCurrency(budget.amount)}`);
            doc.text(`Spent: ${formatCurrency(spent)} (${percentUsed}%)`);
            doc.text(`Remaining: ${formatCurrency(remaining)}`);
            doc.fillColor(statusColor).text(`Status: ${status}`).fillColor('black');
            doc.moveDown(1.5);
        }
    }

    // === INSIGHTS & RECOMMENDATIONS ===
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Insights & Recommendations');
    doc.moveDown(1.5);

    doc.fontSize(11).font('Helvetica-Bold').text('💡 Insights:');
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.5);

    // Generate insights
    const insights: string[] = [];

    // Check overspending
    for (const budget of budgets) {
        const categoryExpenses = await prisma.expense.aggregate({
            where: { userId, category: budget.category, ...(startDate || endDate ? { date: dateFilter } : {}) },
            _sum: { amount: true },
        });
        const spent = categoryExpenses._sum.amount || 0;
        if (spent > budget.amount) {
            insights.push(`• You exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.amount)}`);
        }
    }

    if (balance >= 0) {
        insights.push(`• You saved ${formatCurrency(balance)} during this period`);
    } else {
        insights.push(`• You spent ${formatCurrency(Math.abs(balance))} more than your income`);
    }

    if (insights.length === 0) {
        doc.text('• All spending is within budgets. Great job!');
    } else {
        insights.forEach(insight => doc.text(insight));
    }

    doc.moveDown(1.5);
    doc.fontSize(11).font('Helvetica-Bold').text('📌 Recommendations:');
    doc.fontSize(10).font('Helvetica');
    doc.moveDown(0.5);

    // Simple recommendations
    if (expenseTotal > incomeTotal * 0.8) {
        doc.text('• Consider reducing discretionary spending to increase savings');
    }
    if (savingsRate !== '0' && parseFloat(savingsRate) < 20) {
        doc.text('• Try to save at least 20% of your income for financial security');
    }
    doc.text('• Review your highest spending categories monthly to identify savings opportunities');

    // === CLOSING NOTES ===
    doc.addPage();
    doc.moveDown(10);
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#6b7280');
    doc.text('─'.repeat(80), { align: 'center' });
    doc.moveDown();

    doc.text('Disclaimer: This report is generated by Personal Budget Planner, a personal finance tracking tool.', { align: 'center' });
    doc.text('It is not financial advice. Please consult a financial advisor for personalized recommendations.', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb');
    doc.text('💪 Consistent tracking leads to better financial decisions!', { align: 'center' });
    doc.fillColor('black');

    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280');
    doc.text(`Generated on: ${now.toLocaleDateString('en-IN')} at ${now.toLocaleTimeString('en-IN')}`, { align: 'center' });

    return doc;
}
