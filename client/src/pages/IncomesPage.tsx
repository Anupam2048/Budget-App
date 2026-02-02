import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { incomeAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { validateAmount, validateDate } from '../lib/validation';

type Income = {
    id: string;
    source: string;
    amount: number;
    date: string;
    frequency: string;
};

export default function IncomesPage() {
    const { symbol } = useCurrency();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({ amount: '', date: '' });
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        frequency: 'MONTHLY',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const response = await incomeAPI.getAll();
            // API returns { incomes: [...], total, page, pages, hasMore }
            const data = response.data;

            // Extract incomes array from the response
            if (data && Array.isArray(data.incomes)) {
                setIncomes(data.incomes);
            } else if (Array.isArray(data)) {
                // Fallback: if API returns array directly
                setIncomes(data);
            } else {
                console.warn('Unexpected API response format:', data);
                setIncomes([]);
            }
        } catch (error) {
            console.error('Failed to fetch incomes:', error);
            setIncomes([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const amountValidation = validateAmount(formData.amount);
        const dateValidation = validateDate(formData.date, true); // Allow future dates for income

        if (!amountValidation.valid || !dateValidation.valid) {
            setFormErrors({
                amount: amountValidation.error || '',
                date: dateValidation.error || '',
            });
            return;
        }

        try {
            console.log('Submitting income:', formData);
            const response = await incomeAPI.create({
                source: formData.source,
                amount: parseFloat(formData.amount),
                frequency: formData.frequency,
                date: formData.date,
            });
            console.log('Income created successfully:', response.data);
            await fetchIncomes();
            setIsDialogOpen(false);
            setFormErrors({ amount: '', date: '' });
            setFormData({
                source: '',
                amount: '',
                frequency: 'ONCE',
                date: new Date().toISOString().split('T')[0],
            });
            console.log('✅ Income added successfully');
        } catch (error: any) {
            console.error('Failed to add income:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'We couldn\'t save that income. Please try again.';
            alert(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this income?')) return;
        try {
            await incomeAPI.delete(id);
            await fetchIncomes();
        } catch (error) {
            console.error('Failed to delete income:', error);
            alert('Failed to delete income');
        }
    };

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Income</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Income
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Income</DialogTitle>
                            <DialogDescription>
                                Enter the details of your income source.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                        id="source"
                                        placeholder="e.g., Salary, Freelance"
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                    {formErrors.amount && <p className="text-sm text-red-500">{formErrors.amount}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="frequency">Frequency</Label>
                                    <select
                                        id="frequency"
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="ONCE">One-time</option>
                                        <option value="WEEKLY">Weekly</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                    {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Income</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{symbol}{totalIncome.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Income History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : incomes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No income records yet. Click "Add Income" to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incomes.map((income) => (
                                    <TableRow key={income.id}>
                                        <TableCell className="font-medium">{income.source}</TableCell>
                                        <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{income.frequency}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-green-600 font-semibold">
                                            +{symbol}{income.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(income.id)}
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
