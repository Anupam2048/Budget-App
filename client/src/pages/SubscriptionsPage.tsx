import { useState, useEffect } from 'react';
import { Repeat, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { subscriptionAPI } from '../lib/api';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    billingCycle: string;
    nextBillingDate: string;
    isActive: boolean;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await subscriptionAPI.getAll();
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            if (editingSubscription) {
                await subscriptionAPI.update(editingSubscription.id, data);
            } else {
                await subscriptionAPI.create(data);
            }

            resetForm();
            fetchSubscriptions();
        } catch (error) {
            console.error('Error saving subscription:', error);
            alert('Failed to save subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setFormData({
            name: subscription.name,
            amount: subscription.amount.toString(),
            billingCycle: subscription.billingCycle,
            nextBillingDate: subscription.nextBillingDate.split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subscription?')) return;

        try {
            await subscriptionAPI.delete(id);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error deleting subscription:', error);
            alert('Failed to delete subscription');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            billingCycle: 'MONTHLY',
            nextBillingDate: new Date().toISOString().split('T')[0],
        });
        setEditingSubscription(null);
        setShowForm(false);
    };

    const totalMonthly = subscriptions
        .filter(s => s.billingCycle === 'MONTHLY')
        .reduce((sum, s) => sum + s.amount, 0);

    const totalYearly = subscriptions
        .filter(s => s.billingCycle === 'YEARLY')
        .reduce((sum, s) => sum + s.amount, 0);

    const getDaysUntil = (date: string) => {
        const diff = new Date(date).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const popularSubscriptions = [
        'Netflix', 'Amazon Prime', 'Spotify', 'YouTube Premium',
        'Disney+ Hotstar', 'Apple Music', 'LinkedIn Premium', 'GitHub Pro'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        Subscriptions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your recurring subscriptions</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subscription
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{subscriptions.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
                    <p className="text-3xl font-bold text-cyan-600 mt-2">₹{totalMonthly.toFixed(0)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yearly Cost</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">₹{totalYearly.toFixed(0)}</p>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Service Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Netflix, Spotify"
                                    list="popular-services"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                                <datalist id="popular-services">
                                    {popularSubscriptions.map(service => (
                                        <option key={service} value={service} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="199"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Billing Cycle *</label>
                                <select
                                    value={formData.billingCycle}
                                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Next Billing Date *</label>
                                <input
                                    type="date"
                                    value={formData.nextBillingDate}
                                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                                {isLoading ? 'Saving...' : editingSubscription ? 'Update' : 'Add Subscription'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Subscriptions Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
                {subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Repeat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No subscriptions added yet</p>
                        <p className="text-sm">Click "Add Subscription" to start tracking</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscriptions.map((subscription) => {
                            const daysUntil = getDaysUntil(subscription.nextBillingDate);
                            const isDueSoon = daysUntil <= 7 && daysUntil >= 0;

                            return (
                                <div
                                    key={subscription.id}
                                    className={`p-4 rounded-lg border-2 transition-all ${isDueSoon
                                        ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold flex-1">{subscription.name}</h3>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(subscription)}
                                                className="p-1 h-auto text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(subscription.id)}
                                                className="p-1 h-auto text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Amount</span>
                                            <span className="font-semibold text-emerald-600">₹{subscription.amount.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Billing</span>
                                            <span className="font-medium">{subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Next Billing</span>
                                            <div className="text-right">
                                                <div className="font-medium">{new Date(subscription.nextBillingDate).toLocaleDateString()}</div>
                                                {isDueSoon && (
                                                    <div className="text-xs text-amber-600 flex items-center justify-end gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
