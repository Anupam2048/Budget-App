import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all subscriptions for a user
export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            orderBy: { nextBillingDate: 'asc' }
        });

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
};

// Get single subscription
export const getSubscriptionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const subscription = await prisma.subscription.findFirst({
            where: { id, userId }
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Failed to fetch subscription' });
    }
};

// Create new subscription
export const createSubscription = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { name, amount, billingCycle, nextBillingDate } = req.body;

        // Validation
        if (!name || !amount || !nextBillingDate) {
            return res.status(400).json({
                message: 'Name, amount, and next billing date are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        const validBillingCycles = ['MONTHLY', 'YEARLY'];
        if (billingCycle && !validBillingCycles.includes(billingCycle)) {
            return res.status(400).json({
                message: 'Billing cycle must be MONTHLY or YEARLY'
            });
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId,
                name,
                amount: parseFloat(amount),
                billingCycle: billingCycle || 'MONTHLY',
                nextBillingDate: new Date(nextBillingDate),
                isActive: true
            }
        });

        res.status(201).json(subscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
};

// Update subscription
export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const { name, amount, billingCycle, nextBillingDate, isActive } = req.body;

        // Check if subscription exists and belongs to user
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id, userId }
        });

        if (!existingSubscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Validation
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        const validBillingCycles = ['MONTHLY', 'YEARLY'];
        if (billingCycle && !validBillingCycles.includes(billingCycle)) {
            return res.status(400).json({
                message: 'Billing cycle must be MONTHLY or YEARLY'
            });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
        if (nextBillingDate !== undefined) updateData.nextBillingDate = new Date(nextBillingDate);
        if (isActive !== undefined) updateData.isActive = isActive;

        const subscription = await prisma.subscription.update({
            where: { id },
            data: updateData
        });

        res.json(subscription);
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Failed to update subscription' });
    }
};

// Delete subscription
export const deleteSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        // Check if subscription exists and belongs to user
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id, userId }
        });

        if (!existingSubscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        await prisma.subscription.delete({
            where: { id }
        });

        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ message: 'Failed to delete subscription' });
    }
};
