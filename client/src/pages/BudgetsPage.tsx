import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Plus, Target, AlertTriangle, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
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
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

    const [budgetFormData, setBudgetFormData] = useState({
        category: '',
        amount: '',
        monthYear: new Date().toISOString().slice(0, 7),
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

    // Calculate overall budget stats for selected month
    const currentMonthBudgets = budgets.filter(b => b.monthYear === selectedMonth);
    const totalBudgeted = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + getSpentAmount(b.category, b.monthYear), 0);
    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const remainingBudget = totalBudgeted - totalSpent;
    const categoriesOverBudget = currentMonthBudgets.filter(b => getSpentAmount(b.category, b.monthYear) > b.amount).length;

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
                <div className="flex items-center gap-3">
                    <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-48"
                    />
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
                                            min="0.01"
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
            </div>

            {/* Budget Overview Stats */}
            {currentMonthBudgets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="shadow-soft hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{symbol}{totalBudgeted.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentMonthBudgets.length} {currentMonthBudgets.length === 1 ? 'category' : 'categories'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-soft hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <TrendingDown className="h-4 w-4 text-expense" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-expense">{symbol}{totalSpent.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {budgetUtilization.toFixed(1)}% of budget used
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-soft hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                            <PieChart className={`h-4 w-4 ${remainingBudget >= 0 ? 'text-income' : 'text-expense'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-income' : 'text-expense'}`}>
                                {symbol}{Math.abs(remainingBudget).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {remainingBudget >= 0 ? 'Still available' : 'Over budget'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-soft hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${categoriesOverBudget > 0 ? 'text-expense' : 'text-income'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${categoriesOverBudget > 0 ? 'text-expense' : 'text-income'}`}>
                                {categoriesOverBudget > 0 ? `${categoriesOverBudget} Over` : 'On Track'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {categoriesOverBudget > 0
                                    ? `${categoriesOverBudget} ${categoriesOverBudget === 1 ? 'category' : 'categories'} exceeded`
                                    : 'All budgets healthy'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Budget Cards */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading budgets...</div>
                ) : currentMonthBudgets.length === 0 ? (
                    <Card className="shadow-soft">
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Target className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No budgets for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                    Set monthly budgets to track your spending and stay on target
                                </p>
                                <Button onClick={() => setIsBudgetDialogOpen(true)} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Set Your First Budget
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentMonthBudgets.map((budget) => {
                            const spent = getSpentAmount(budget.category, budget.monthYear);
                            const percentage = (spent / budget.amount) * 100;
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
                                                {Math.min(percentage, 999).toFixed(0)}%
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress
                                            value={Math.min(percentage, 100)}
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
                                        {isOver ? (
                                            <div className="mt-3 p-2 bg-expense-light rounded-md">
                                                <p className="text-xs text-expense font-medium">⚠️ Over budget by {symbol}{(spent - budget.amount).toFixed(2)}</p>
                                            </div>
                                        ) : isWarning ? (
                                            <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                                                <p className="text-xs text-yellow-700 font-medium">⚡ Approaching limit - {symbol}{(budget.amount - spent).toFixed(2)} left</p>
                                            </div>
                                        ) : (
                                            <div className="mt-3 p-2 bg-income-light rounded-md">
                                                <p className="text-xs text-income font-medium">✓ {symbol}{(budget.amount - spent).toFixed(2)} remaining</p>
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
                    <Card className="shadow-soft">
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Target className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No savings goals yet</h3>
                                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                    Set savings goals to track your progress towards financial milestones
                                </p>
                                <Button onClick={() => setIsGoalDialogOpen(true)} size="sm" variant="secondary">
                                    <Target className="mr-2 h-4 w-4" />
                                    Create Your First Goal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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
