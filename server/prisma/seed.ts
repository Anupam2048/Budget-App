import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create a demo user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            password: hashedPassword,
            incomes: {
                create: [
                    { source: 'Full-time Salary', amount: 5000, frequency: 'MONTHLY', date: new Date() },
                    { source: 'Freight Project', amount: 1200, frequency: 'ONCE', date: new Date() },
                ]
            },
            expenses: {
                create: [
                    { category: 'Rent', amount: 1500, date: new Date(), notes: 'Monthly rent' },
                    { category: 'Food', amount: 150, date: new Date(), notes: 'Grocery run' },
                    { category: 'Utilities', amount: 120, date: new Date(), notes: 'Electric bill' },
                    { category: 'Entertainment', amount: 60, date: new Date(), notes: 'Movie night' },
                ]
            },
            budgets: {
                create: [
                    { category: 'Food', amount: 600, monthYear: '2023-10' },
                    { category: 'Rent', amount: 1500, monthYear: '2023-10' },
                ]
            },
            goals: {
                create: [
                    { name: 'Vacation Fund', targetAmount: 2000, currentAmount: 500, deadline: new Date('2024-01-01') },
                    { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500 },
                ]
            }
        },
    });

    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
