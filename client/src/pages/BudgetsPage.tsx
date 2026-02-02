import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Plus, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { budgetAPI, goalAPI, expenseAPI, incomeAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';

type Budget = {
    id: string;
    category: string;
    amount: number;
    monthYear: string;
};

type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
};

export default function BudgetsPage() {
    const { symbol } = useCurrency();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

    const [budgetFormData, setBudgetFormData] = useState({
        category: '',
        amount: '',
        monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM
    });

    const [goalFormData, setGoalFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [budgetsRes, goalsRes, expensesRes, incomesRes] = await Promise.all([
                budgetAPI.getAll(),
                goalAPI.getAll(),
                expenseAPI.getAll(),
                incomeAPI.getAll(),
            ]);
            setBudgets(budgetsRes.data);
            setGoals(goalsRes.data);

            // Handle new API format
            const expensesData = Array.isArray(expensesRes.data) ? expensesRes.data : expensesRes.data.expenses;
            setExpenses(expensesData || []);

            // Calculate total monthly income
            const incomesData = Array.isArray(incomesRes.data) ? incomesRes.data : incomesRes.data.incomes;
            const monthlyIncome = (incomesData || []).reduce((sum: number, inc: any) => {
                if (inc.frequency === 'MONTHLY') return sum + inc.amount;
                if (inc.frequency === 'YEARLY') return sum + (inc.amount / 12);
                return sum;
            }, 0);

            // Check if budgets exceed income
            const totalBudgets = budgetsRes.data.reduce((sum: number, b: any) => sum + b.amount, 0);
            if (totalBudgets > monthlyIncome && monthlyIncome > 0) {
                console.warn(`⚠️ Your total budgets (${totalBudgets}) exceed your monthly income (${monthlyIncome})`);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await budgetAPI.create({
                category: budgetFormData.category,
                amount: parseFloat(budgetFormData.amount),
                monthYear: budgetFormData.monthYear,
            });
            await fetchData();
            setIsBudgetDialogOpen(false);
            setBudgetFormData({
                category: '',
                amount: '',
                monthYear: new Date().toISOString().slice(0, 7),
            });
        } catch (error) {
            console.error('Failed to add budget:', error);
            alert('Failed to add budget');
        }
    };

    const handleGoalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await goalAPI.create({
                name: goalFormData.name,
                targetAmount: parseFloat(goalFormData.targetAmount),
                currentAmount: parseFloat(goalFormData.currentAmount),
                deadline: goalFormData.deadline || undefined,
            });
            await fetchData();
            setIsGoalDialogOpen(false);
            setGoalFormData({
                name: '',
                targetAmount: '',
                currentAmount: '0',
                deadline: '',
            });
        } catch (error) {
            console.error('Failed to add goal:', error);
            alert('Failed to add goal');
        }
    };

    // Calculate spent amount per budget category
    const getSpentAmount = (category: string, monthYear: string) => {
        return expenses
            .filter(exp => {
                const expenseMonth = new Date(exp.date).toISOString().slice(0, 7);
                return exp.category === category && expenseMonth === monthYear;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    };

    return (
        <div className="space-y-6">
            {/* Budgets Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
                    <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Set Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set Monthly Budget</DialogTitle>
                                <DialogDescription>
                                    Set a spending limit for a category.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleBudgetSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="budget-category">Category</Label>
                                        <select
                                            id="budget-category"
                                            value={budgetFormData.category}
                                            onChange={(e) => setBudgetFormData({ ...budgetFormData, category: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="Food">Food</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="budget-amount">Budget Amount ($)</Label>
                                        <Input
                                            id="budget-amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={budgetFormData.amount}
                                            onChange={(e) => setBudgetFormData({ ...budgetFormData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="budget-month">Month</Label>
                                        <Input
                                            id="budget-month"
                                            type="month"
                                            value={budgetFormData.monthYear}
                                            onChange={(e) => setBudgetFormData({ ...budgetFormData, monthYear: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Set Budget</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading budgets...</div>
                ) : budgets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No budgets set yet. Click "Set Budget" to create one.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => {
                            const spent = getSpentAmount(budget.category, budget.monthYear);
                            const percentage = Math.min((spent / budget.amount) * 100, 100);
                            const isOver = spent > budget.amount;
                            const isWarning = percentage > 80 && !isOver;

                            return (
                                <Card key={budget.id} className={`shadow-soft hover-lift transition-all ${isOver ? 'border-expense ring-2 ring-expense-light' : ''
                                    }`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CategoryIcon category={budget.category} size="md" />
                                            <div className="flex-1">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    {budget.category}
                                                    {isOver && (
                                                        <AlertTriangle className="h-4 w-4 text-expense" />
                                                    )}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">{budget.monthYear}</p>
                                            </div>
                                            <span className={`text-lg font-bold ${isOver ? "text-expense" : isWarning ? "text-yellow-600" : "text-muted-foreground"
                                                }`}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress
                                            value={percentage}
                                            variant={isOver ? 'danger' : isWarning ? 'warning' : 'success'}
                                            className="h-3 mb-3"
                                        />
                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Spent: </span>
                                                <span className={`font-semibold ${isOver ? 'text-expense' : 'text-foreground'}`}>
                                                    {symbol}{spent.toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Limit: </span>
                                                <span className="font-medium">{symbol}{budget.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        {isOver && (
                                            <div className="mt-3 p-2 bg-expense-light rounded-md">
                                                <p className="text-xs text-expense font-medium">⚠️ Over budget by {symbol}{(spent - budget.amount).toFixed(2)}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Goals Section */}
            <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Savings Goals</h2>
                    <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <Target className="mr-2 h-4 w-4" /> Add Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Savings Goal</DialogTitle>
                                <DialogDescription>
                                    Set a financial goal to work towards.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleGoalSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="goal-name">Goal Name</Label>
                                        <Input
                                            id="goal-name"
                                            placeholder="e.g., Vacation, Emergency Fund"
                                            value={goalFormData.name}
                                            onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="goal-target">Target Amount ($)</Label>
                                        <Input
                                            id="goal-target"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={goalFormData.targetAmount}
                                            onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="goal-current">Current Amount ($)</Label>
                                        <Input
                                            id="goal-current"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={goalFormData.currentAmount}
                                            onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                                        <Input
                                            id="goal-deadline"
                                            type="date"
                                            value={goalFormData.deadline}
                                            onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create Goal</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No savings goals yet. Click "Add Goal" to create one.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {goals.map((goal) => {
                            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            const isCompleted = percentage >= 100;

                            return (
                                <Card key={goal.id} className={`shadow-soft hover-lift transition-all ${isCompleted ? 'border-income ring-2 ring-income-light' : ''
                                    }`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className={`h-5 w-5 ${isCompleted ? 'text-income' : 'text-purple-500'}`} />
                                            {goal.name}
                                            {isCompleted && <span className="text-sm">🎉</span>}
                                        </CardTitle>
                                        <CardDescription>
                                            Target: {symbol}{goal.targetAmount.toFixed(2)}
                                            {goal.deadline && ` by ${new Date(goal.deadline).toLocaleDateString()}`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-semibold text-foreground">
                                                    {symbol}{goal.currentAmount.toFixed(2)} saved
                                                </span>
                                                <span className={`font-bold ${isCompleted ? 'text-income' : 'text-muted-foreground'
                                                    }`}>
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                variant={isCompleted ? 'success' : 'default'}
                                                className="h-3"
                                            />
                                            {isCompleted && (
                                                <div className="mt-2 p-2 bg-income-light rounded-md">
                                                    <p className="text-xs text-income font-medium flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        Goal achieved! Great job!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )
                }
            </div>
        </div>
    );
}
