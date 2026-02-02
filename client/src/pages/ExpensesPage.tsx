import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Trash2, TrendingDown } from "lucide-react";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { expenseAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { validateAmount, validateDate, checkDuplicateExpense } from '../lib/validation';
import { TableSkeleton } from '../components/ui/skeleton';

type Expense = {
    id: string;
    category: string;
    amount: number;
    date: string;
    notes?: string;
    paymentMethod?: string;
};

export default function ExpensesPage() {
    const { symbol } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({ amount: '', date: '' });
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        paymentMethod: '',
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await expenseAPI.getAll();
            // Handle both old format (array) and new format (object with expenses array)
            const expensesData = Array.isArray(response.data) ? response.data : response.data.expenses;
            setExpenses(expensesData || []);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate amount
        const amountValidation = validateAmount(formData.amount);
        const dateValidation = validateDate(formData.date, false);

        if (!amountValidation.valid || !dateValidation.valid) {
            setFormErrors({
                amount: amountValidation.error || '',
                date: dateValidation.error || '',
            });
            return;
        }

        // Check for duplicates
        const newExpense = {
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date,
        };

        if (checkDuplicateExpense(expenses, newExpense)) {
            if (!confirm('Similar expense found recently. Add anyway?')) {
                return;
            }
        }

        try {
            await expenseAPI.create({
                category: formData.category,
                amount: newExpense.amount,
                date: formData.date,
                notes: formData.notes || undefined,
                paymentMethod: formData.paymentMethod || undefined,
            });
            await fetchExpenses();
            setIsDialogOpen(false);
            setFormErrors({ amount: '', date: '' });
            setFormData({
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                notes: '',
                paymentMethod: '',
            });
            // Success feedback (will be toast after sonner is installed)
            console.log('✅ Expense added successfully');
        } catch (error) {
            console.error('Failed to add expense:', error);
            alert('We couldn\'t save that expense. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await expenseAPI.delete(id);
            await fetchExpenses();
        } catch (error) {
            console.error('Failed to delete expense:', error);
            alert('Failed to delete expense');
        }
    };

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Client-side filtering for now (can be moved to server later)
    const filteredExpenses = expenses.filter(expense => {
        if (filterCategory && expense.category !== filterCategory) return false;
        if (searchQuery && !expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Record a new expense transaction.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        autoFocus
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
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max="10000000"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => {
                                            setFormData({ ...formData, amount: e.target.value });
                                            if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                                        }}
                                        className={formErrors.amount ? 'border-red-500' : ''}
                                        required
                                    />
                                    {formErrors.amount && (
                                        <p className="text-sm text-red-500">{formErrors.amount}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={formData.date}
                                        onChange={(e) => {
                                            setFormData({ ...formData, date: e.target.value });
                                            if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                                        }}
                                        className={formErrors.date ? 'border-red-500' : ''}
                                        required
                                    />
                                    {formErrors.date && (
                                        <p className="text-sm text-red-500">{formErrors.date}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
                                    <Input
                                        id="paymentMethod"
                                        placeholder="e.g., Credit Card, Cash"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Additional details"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Expense</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-soft hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-expense" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-expense">{symbol}{totalExpense.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time spending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3 items-center">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Rent">Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                </select>
                <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <TableSkeleton rows={5} />
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Trash2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No expenses tracked yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                Start logging your spending to track where your money goes and stay on budget
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)} size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Expense
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon category={expense.category} size="sm" />
                                                <span>{expense.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-muted-foreground">{expense.notes || '-'}</TableCell>
                                        <TableCell className="text-right text-red-500 font-semibold">
                                            -{symbol}{expense.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(expense.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
