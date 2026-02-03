import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Wallet, PieChart as PieChartIcon, TrendingUp as TrendIcon, Target, AlertTriangle, Lightbulb, AlertCircle, ThumbsUp } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { analyticsAPI, budgetAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { Progress } from "../components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, CartesianGrid } from 'recharts';

type Insight = {
    type: string;
    message: string;
    icon: string;
};

export default function Dashboard() {
    const { symbol } = useCurrency();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        recentTransactions: [] as any[],
        categoryExpenses: [] as any[],
        monthlyTrend: [] as any[],
    });
    const [budgets, setBudgets] = useState<any[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch dashboard data with fallback for ad-blockers
            let dashData = {
                totalIncome: 0,
                totalExpense: 0,
                balance: 0,
                recentTransactions: [],
                categoryExpenses: [],
                monthlyTrend: [],
            };

            try {
                const response = await analyticsAPI.getDashboard();
                dashData = response.data;
            } catch (err) {
                console.warn('Analytics blocked or failed (likely ad-blocker), using default stats');
            }

            const [budgetRes, insightsRes] = await Promise.all([
                budgetAPI.getAll().catch(() => ({ data: [] })),
                analyticsAPI.getInsights().catch(() => ({ data: { insights: [] } }))
            ]);

            setStats(dashData);
            setBudgets(budgetRes.data || []);
            setInsights(insightsRes.data.insights || []);
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

    // Chart colors
    const COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    // Calculate savings rate
    const savingsRate = stats.totalIncome > 0
        ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100)
        : 0;

    // Prepare category data for pie chart
    const categoryData = stats.categoryExpenses && stats.categoryExpenses.length > 0
        ? stats.categoryExpenses.map((cat: any) => ({
            name: cat.category,
            value: cat.total
        }))
        : [];

    // Prepare income vs expense data for bar chart
    const incomeVsExpenseData = stats.monthlyTrend && stats.monthlyTrend.length > 0
        ? stats.monthlyTrend
        : [
            { month: 'Current', income: stats.totalIncome, expense: stats.totalExpense }
        ];

    // Get insight icon component
    const getInsightIcon = (iconName: string) => {
        const iconMap: Record<string, any> = {
            'TrendingUp': TrendingUp,
            'TrendingDown': TrendingDown,
            'PieChart': PieChartIcon,
            'AlertTriangle': AlertTriangle,
            'AlertCircle': AlertCircle,
            'Target': Target,
            'ThumbsUp': ThumbsUp,
        };
        return iconMap[iconName] || Lightbulb;
    };

    // Get insight color based on type
    const getInsightColor = (type: string) => {
        const colorMap: Record<string, string> = {
            'success': 'bg-green-50 border-green-200 text-green-800',
            'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
            'alert': 'bg-red-50 border-red-200 text-red-800',
            'info': 'bg-blue-50 border-blue-200 text-blue-800',
        };
        return colorMap[type] || 'bg-gray-50 border-gray-200 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Your financial overview at a glance</p>
                </div>
            </div>

            {/* AI Insights Section */}
            {insights.length > 0 && (
                <Card className="shadow-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-emerald-600" />
                            Financial Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {insights.map((insight, index) => {
                                const Icon = getInsightIcon(insight.icon);
                                return (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm font-medium leading-relaxed">{insight.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    title="Savings Rate"
                    value={`${savingsRate.toFixed(1)}%`}
                    description={savingsRate >= 20 ? "Great saving habits!" : "Try to save more"}
                    icon={Wallet}
                    iconColor={savingsRate >= 20 ? "text-emerald-500" : "text-amber-500"}
                    gradient={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Category-wise Spending - Pie Chart */}
                <Card className="col-span-4 lg:col-span-3 shadow-lg border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-emerald-500" />
                            Spending by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `${symbol}${Number(value).toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No expense data yet</p>
                                    <p className="text-sm">Start adding expenses to see insights</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Income vs Expense - Bar Chart */}
                <Card className="col-span-4 shadow-lg border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendIcon className="w-5 h-5 text-cyan-500" />
                            Income vs Expense
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={incomeVsExpenseData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => `${symbol}${Number(value).toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="income" fill="#10B981" name="Income" />
                                <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Progress & Recent Transactions */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Budget Progress */}
                <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-500" />
                            Budget Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {budgets.length > 0 ? (
                            <div className="space-y-4">
                                {budgets.slice(0, 5).map((budget: any) => {
                                    const percentage = (budget.spent / budget.amount) * 100;
                                    const isWarning = percentage >= 80 && percentage < 100;
                                    const isDanger = percentage >= 100;

                                    return (
                                        <div key={budget.id} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{budget.category}</span>
                                                <span className={`font-semibold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {symbol}{budget.spent?.toFixed(0) || 0} / {symbol}{budget.amount.toFixed(0)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(percentage, 100)}
                                                className={isDanger ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-emerald-100'}
                                            />
                                            {isDanger && (
                                                <p className="text-xs text-red-600">⚠️ Budget exceeded!</p>
                                            )}
                                            {isWarning && !isDanger && (
                                                <p className="text-xs text-amber-600">⚠️ Approaching limit</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No budgets set</p>
                                <p className="text-sm">Create budgets to track spending</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-orange-500" />
                            Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div>
                                                <p className="font-medium text-sm">{transaction.category || transaction.source}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}{symbol}{transaction.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No recent transactions</p>
                                <p className="text-sm">Start tracking your finances</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
