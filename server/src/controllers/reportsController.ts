import { Response } from 'express';
import { generateFinancialReport } from '../services/pdfReportService';
import prisma from '../utils/db';

// Currency code to symbol mapping (same as frontend)
const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
};

export const downloadReport = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        // Fetch user details from database (JWT doesn't include currency)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, currency: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userName = user.name;
        const currencyCode = user.currency || 'USD';
        const currencySymbol = currencySymbols[currencyCode] || '$';

        // Generate filename
        const dateRange = startDate && endDate
            ? `${startDate}_to_${endDate}`
            : 'All_Time';
        const filename = `Budget_Report_${dateRange}.pdf`;

        // Generate PDF
        const doc = await generateFinancialReport({
            userId,
            userName,
            currency: currencySymbol,
            startDate,
            endDate,
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream PDF to response
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Failed to generate report' });
    }
};
