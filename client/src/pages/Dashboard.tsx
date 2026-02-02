import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Wallet, Target } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { analyticsAPI, budgetAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { Progress } from "../components/ui/progress";

export default function Dashboard() {
    const { symbol } = useCurrency();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        recentTransactions: [] as any[],
    });
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, budgetRes] = await Promise.all([
                analyticsAPI.getDashboard(),
                budgetAPI.getAll().catch(() => ({ data: [] }))
            ]);
            setStats(dashRes.data);
            setBudgets(budgetRes.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Balance"
                    value={`${symbol}${stats.balance.toFixed(2)}`}
                    description={stats.balance >= 0 ? "Positive balance" : "Negative balance"}
                    icon={DollarSign}
                    iconColor={stats.balance >= 0 ? "text-balance" : "text-expense"}
                    trend={stats.balance >= 0 ? "up" : "down"}
                    gradient={true}
                />
                <StatCard
                    title="Total Income"
                    value={`${symbol}${stats.totalIncome.toFixed(2)}`}
                    description="All time earnings"
                    icon={TrendingUp}
                    iconColor="text-income"
                    trend="up"
                    gradient={true}
                />
                <StatCard
                    title="Total Expenses"
                    value={`${symbol}${stats.totalExpense.toFixed(2)}`}
                    description="All time spending"
                    icon={TrendingDown}
                    iconColor="text-expense"
                    trend="down"
                    gradient={true}
                />
                <StatCard
                    title="Recent Activity"
                    value={stats.recentTransactions.length}
                    description="Latest transactions"
                    icon={Wallet}
                    iconColor="text-orange-500"
                    gradient={true}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Financial Overview */}
                <Card className="col-span-4 shadow-soft hover-lift">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[250px] flex items-center justify-center">
                            <div className="text-center space-y-4 w-full px-8">
                                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {symbol}{stats.balance.toFixed(2)}
                                </div>
                                <p className="text-muted-foreground text-sm">Current Balance</p>

                                {/* Income vs Expense Visual */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="text-center p-4 bg-income-light rounded-lg">
                                        <div className="text-2xl font-bold text-income">{symbol}{stats.totalIncome.toFixed(0)}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Total Income</p>
                                    </div>
                                    <div className="text-center p-4 bg-expense-light rounded-lg">
                                        <div className="text-2xl font-bold text-expense">{symbol}{stats.totalExpense.toFixed(0)}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Total Expenses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="col-span-3 shadow-soft hover-lift">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Last {stats.recentTransactions.length} activities
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {stats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                                <div key={index} className="flex items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
                                        }`}>
                                        {transaction.type === 'income' ? (
                                            <TrendingUp className="h-5 w-5 text-income" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-expense" />
                                        )}
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">
                                            {transaction.source || transaction.category}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`ml-auto font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}{symbol}{transaction.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {stats.recentTransactions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No transactions yet. Start tracking your finances!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Overview */}
            {budgets.length > 0 && (
                <Card className="shadow-soft">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-500" />
                            <CardTitle>Budget Overview</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">Top 3 budget categories</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {budgets.slice(0, 3).map((budget: any) => {
                                const percentage = Math.min((budget.spent || 0) / budget.amount * 100, 100);
                                const isOver = percentage >= 100;

                                return (
                                    <div key={budget.id} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{budget.category}</span>
                                            <span className={isOver ? 'text-expense font-semibold' : 'text-muted-foreground'}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            variant={isOver ? 'danger' : percentage > 80 ? 'warning' : 'success'}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{symbol}{(budget.spent || 0).toFixed(2)}</span>
                                            <span>{symbol}{budget.amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
