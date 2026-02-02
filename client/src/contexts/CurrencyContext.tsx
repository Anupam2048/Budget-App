import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

type CurrencyContextType = {
    currency: string;
    symbol: string;
    refreshCurrency: () => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState('USD');
    const [symbol, setSymbol] = useState('$');

    const refreshCurrency = async () => {
        try {
            const response = await authAPI.getMe();
            const userCurrency = response.data.currency || 'USD';
            setCurrency(userCurrency);
            setSymbol(CURRENCY_SYMBOLS[userCurrency] || '$');
        } catch (error) {
            console.error('Failed to fetch currency preference:', error);
        }
    };

    useEffect(() => {
        refreshCurrency();
    }, []);

    return (
        <CurrencyContext.Provider value={{ currency, symbol, refreshCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
    return `${symbol}${amount.toFixed(2)}`;
};
