import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Trash2, TrendingDown, Edit, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
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

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

export default function ExpensesPage() {
    const { symbol } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formErrors, setFormErrors] = useState({ amount: '', date: '' });
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [showFilters, setShowFilters] = useState(false);
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

        const amountValidation = validateAmount(formData.amount);
        const dateValidation = validateDate(formData.date, false);

        if (!amountValidation.valid || !dateValidation.valid) {
            setFormErrors({
                amount: amountValidation.error || '',
                date: dateValidation.error || '',
            });
            return;
        }

        try {
            const expenseData = {
                category: formData.category,
                amount: parseFloat(formData.amount),
                date: formData.date,
                notes: formData.notes || undefined,
                paymentMethod: formData.paymentMethod || undefined,
            };

            if (isEditMode && editingExpense) {
                await expenseAPI.update(editingExpense.id, expenseData);
            } else {
                // Check for duplicates only when adding
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

                await expenseAPI.create(expenseData);
            }

            await fetchExpenses();
            resetForm();
            console.log(`✅ Expense ${isEditMode ? 'updated' : 'added'} successfully`);
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'add'} expense:`, error);
            alert(`We couldn't save that expense. Please try again.`);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsEditMode(true);
        setFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            date: expense.date.split('T')[0],
            notes: expense.notes || '',
            paymentMethod: expense.paymentMethod || '',
        });
        setIsDialogOpen(true);
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

    const resetForm = () => {
        setIsDialogOpen(false);
        setIsEditMode(false);
        setEditingExpense(null);
        setFormErrors({ amount: '', date: '' });
        setFormData({
            category: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            paymentMethod: '',
        });
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Filter and sort expenses
    const filteredAndSortedExpenses = expenses
        .filter(expense => {
            if (filterCategory && expense.category !== filterCategory) return false;
            if (searchQuery && !expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !expense.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (dateFrom && new Date(expense.date) < new Date(dateFrom)) return false;
            if (dateTo && new Date(expense.date) > new Date(dateTo)) return false;
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortField === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortField === 'amount') {
                comparison = a.amount - b.amount;
            } else if (sortField === 'category') {
                comparison = a.category.localeCompare(b.category);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const filteredTotal = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsDialogOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                            <DialogDescription>
                                {isEditMode ? 'Update expense details.' : 'Record a new expense transaction.'}
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
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {isEditMode ? 'Update' : 'Add'} Expense
                                </Button>
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
                <Card className="shadow-soft hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filtered Total</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{symbol}{filteredTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{filteredAndSortedExpenses.length} expenses shown</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card className="shadow-soft">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Search & Filter</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search bar - always visible */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by category or notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Advanced filters - collapsible */}
                    {showFilters && (
                        <div className="grid gap-4 md:grid-cols-3 pt-2 border-t">
                            <div>
                                <Label className="text-sm mb-2 block">Category</Label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                            </div>
                            <div>
                                <Label className="text-sm mb-2 block">From Date</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    max={dateTo || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <Label className="text-sm mb-2 block">To Date</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    min={dateFrom}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Clear filters button */}
                    {(searchQuery || filterCategory || dateFrom || dateTo) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterCategory('');
                                setDateFrom('');
                                setDateTo('');
                            }}
                        >
                            Clear All Filters
                        </Button>
                    )}
                </CardContent>
            </Card>

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
                    ) : filteredAndSortedExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No expenses match your filters</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Try adjusting your search or filter criteria
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('');
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort('category')}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Category
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort('date')}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Date
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">
                                        <button
                                            onClick={() => handleSort('amount')}
                                            className="flex items-center gap-1 hover:text-foreground ml-auto"
                                        >
                                            Amount
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedExpenses.map((expense) => (
                                    <TableRow key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon category={expense.category} size="sm" />
                                                <span>{expense.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {expense.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-red-500 font-semibold">
                                            -{symbol}{expense.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(expense)}
                                                    title="Edit expense"
                                                >
                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(expense.id)}
                                                    title="Delete expense"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
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
