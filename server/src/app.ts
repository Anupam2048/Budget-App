import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import emiRoutes from './routes/emiRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5174', 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        console.log('Body:', req.body);
    }
    next();
});

// API v1 Routes
app.use('/auth', authRoutes); // Keep auth at root for simplicity
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/emis', emiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'SpendZen API is running',
        version: '1.0',
        tagline: 'Spend smarter. Save better.'
    });
});

// Error handling middleware (MUST be after all routes)
app.use(notFoundHandler); // 404 handler
app.use(errorHandler);    // Global error handler

export default app;
