import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { analyticsAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Dashboard() {
    const { symbol } = useCurrency();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        recentTransactions: [] as any[],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await analyticsAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const dashboardCards = [
        {
            title: "Total Balance",
            value: `${symbol}${stats.balance.toFixed(2)}`,
            change: stats.balance >= 0 ? "Positive balance" : "Negative balance",
            icon: DollarSign,
            color: stats.balance >= 0 ? "text-green-500" : "text-red-500",
        },
        {
            title: "Total Income",
            value: `${symbol}${stats.totalIncome.toFixed(2)}`,
            change: "All time",
            icon: TrendingUp,
            color: "text-blue-500",
        },
        {
            title: "Total Expenses",
            value: `${symbol}${stats.totalExpense.toFixed(2)}`,
            change: "All time",
            icon: TrendingDown,
            color: "text-red-500",
        },
        {
            title: "Recent Activity",
            value: stats.recentTransactions.length.toString(),
            change: "Transactions",
            icon: Wallet,
            color: "text-orange-500",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardCards.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-primary">
                                    ${stats.balance.toFixed(2)}
                                </div>
                                <p className="text-muted-foreground">Current Balance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Last {stats.recentTransactions.length} activities
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentTransactions.slice(0, 3).map((transaction: any, index: number) => (
                                <div key={index} className="flex items-center">
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">
                                            {transaction.source || transaction.category}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {stats.recentTransactions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No transactions yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
