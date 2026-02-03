import { useState, useEffect } from 'react';
import { CreditCard, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { emiAPI } from '../lib/api';

interface EMI {
    id: string;
    name: string;
    amount: number;
    totalAmount?: number;
    dueDate: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
}

export default function EMIPage() {
    const [emis, setEmis] = useState<EMI[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEMI, setEditingEMI] = useState<EMI | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        totalAmount: '',
        dueDate: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    });

    useEffect(() => {
        fetchEMIs();
    }, []);

    const fetchEMIs = async () => {
        try {
            const response = await emiAPI.getAll();
            setEmis(response.data);
        } catch (error) {
            console.error('Error fetching EMIs:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
                totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
                dueDate: parseInt(formData.dueDate),
            };

            if (editingEMI) {
                await emiAPI.update(editingEMI.id, data);
            } else {
                await emiAPI.create(data);
            }

            resetForm();
            fetchEMIs();
        } catch (error) {
            console.error('Error saving EMI:', error);
            alert('Failed to save EMI');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (emi: EMI) => {
        setEditingEMI(emi);
        setFormData({
            name: emi.name,
            amount: emi.amount.toString(),
            totalAmount: emi.totalAmount?.toString() || '',
            dueDate: emi.dueDate.toString(),
            startDate: emi.startDate.split('T')[0],
            endDate: emi.endDate ? emi.endDate.split('T')[0] : '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this EMI?')) return;

        try {
            await emiAPI.delete(id);
            fetchEMIs();
        } catch (error) {
            console.error('Error deleting EMI:', error);
            alert('Failed to delete EMI');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            totalAmount: '',
            dueDate: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
        });
        setEditingEMI(null);
        setShowForm(false);
    };

    const today = new Date().getDate();
    const totalMonthlyEMI = emis.reduce((sum, emi) => sum + emi.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        EMI Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Track your loans and EMI payments</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                    <Plus className="w-5 h-5 mr-2" />
                    Add EMI
                </Button>
            </div>

            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Monthly EMI Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total EMIs</p>
                        <p className="text-2xl font-bold text-emerald-600">{emis.length}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
                        <p className="text-2xl font-bold text-cyan-600">₹{totalMonthlyEMI.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">{editingEMI ? 'Edit EMI' : 'Add New EMI'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">EMI Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Car Loan, Home Loan"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Monthly Amount (₹) *</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="10000"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Total Loan Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.totalAmount}
                                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                placeholder="500000"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Due Date (Day of Month) *</label>
                            <input
                                type="number"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                placeholder="15"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                required
                                min="1"
                                max="31"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                                {isLoading ? 'Saving...' : editingEMI ? 'Update EMI' : 'Add EMI'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* EMI List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Your EMIs</h2>
                    {emis.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No EMIs added yet</p>
                            <p className="text-sm">Click "Add EMI" to start tracking your loans</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {emis.map((emi) => {
                                const isDueSoon = Math.abs(today - emi.dueDate) <= 7;
                                return (
                                    <div
                                        key={emi.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${isDueSoon
                                            ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">{emi.name}</h3>
                                                    {isDueSoon && (
                                                        <span className="flex items-center text-xs bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Due soon
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 dark:text-gray-400">Monthly Payment</p>
                                                        <p className="font-semibold text-emerald-600">₹{emi.amount.toFixed(0)}</p>
                                                    </div>
                                                    {emi.totalAmount && (
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                                                            <p className="font-semibold">₹{emi.totalAmount.toFixed(0)}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-gray-600 dark:text-gray-400">Due Date</p>
                                                        <p className="font-semibold">{emi.dueDate} of every month</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 dark:text-gray-400">Period</p>
                                                        <p className="font-semibold text-xs">
                                                            {new Date(emi.startDate).toLocaleDateString()} - {emi.endDate ? new Date(emi.endDate).toLocaleDateString() : 'Ongoing'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(emi)}
                                                    className="text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(emi.id)}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
