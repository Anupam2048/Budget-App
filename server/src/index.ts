import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportsRoutes from './routes/reportsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

app.use('/auth', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/', (req, res) => {
    res.send('Personal Budget Planner API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
