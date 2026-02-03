/**
 * Validation utilities for financial data
 */

export const validateAmount = (value: string): { valid: boolean; error?: string } => {
    const num = parseFloat(value);

    if (!value || value.trim() === '') {
        return { valid: false, error: 'Amount is required' };
    }

    if (isNaN(num)) {
        return { valid: false, error: 'Please enter a valid number' };
    }

    if (num <= 0) {
        return { valid: false, error: 'Amount must be greater than zero' };
    }

    if (num > 10000000) {
        return { valid: false, error: 'Amount seems unreasonably large' };
    }

    // Check for at most 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return { valid: false, error: 'Use at most 2 decimal places' };
    }

    return { valid: true };
};

export const validateDate = (dateString: string, allowFuture = false): { valid: boolean; error?: string } => {
    if (!dateString) {
        return { valid: false, error: 'Date is required' };
    }

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date' };
    }

    if (!allowFuture && date > today) {
        return { valid: false, error: "Can't log transactions from the future" };
    }

    return { valid: true };
};

export const checkDuplicateExpense = (
    expenses: any[],
    newExpense: { amount: number; category: string; date: string }
): boolean => {
    const newDate = new Date(newExpense.date);

    return expenses.some(exp => {
        const expDate = new Date(exp.date);
        return (
            exp.amount === newExpense.amount &&
            exp.category === newExpense.category &&
            Math.abs(expDate.getTime() - newDate.getTime()) < 5 * 60 * 1000
        );
    });
};

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
    return `${symbol}${amount.toFixed(2)}`;
};

export const getDaysLeftInMonth = (): number => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = lastDay.getDate() - now.getDate();
    return daysLeft;
};
