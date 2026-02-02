import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User, Lock, Download, Trash2 } from "lucide-react";
import { authAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { refreshCurrency } = useCurrency();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        currency: 'USD',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data);
            setProfileForm({
                name: response.data.name,
                email: response.data.email,
                currency: response.data.currency || 'USD',
            });
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authAPI.updateProfile({
                name: profileForm.name,
                email: profileForm.email,
                currency: profileForm.currency,
            });
            await fetchUserData();
            await refreshCurrency(); // Refresh currency context
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        alert('Password change feature coming soon!');
        // TODO: Implement password change API endpoint
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleExportData = () => {
        alert('Export feature is available on the Insights page!');
        navigate('/insights');
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you ABSOLUTELY SURE you want to delete your account? This action cannot be undone.')) {
            if (confirm('All your financial data will be permanently deleted. Continue?')) {
                alert('Account deletion feature coming soon!');
                // TODO: Implement account deletion
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your account details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Preferred Currency</Label>
                            <select
                                id="currency"
                                value={profileForm.currency}
                                onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="USD">USD ($) - US Dollar</option>
                                <option value="EUR">EUR (€) - Euro</option>
                                <option value="GBP">GBP (£) - British Pound</option>
                                <option value="INR">INR (₹) - Indian Rupee</option>
                                <option value="JPY">JPY (¥) - Japanese Yen</option>
                                <option value="AUD">AUD (A$) - Australian Dollar</option>
                                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                                <option value="CHF">CHF (CHF) - Swiss Franc</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                This will update all currency displays in the app
                            </p>
                        </div>
                        <Button type="submit">Update Profile</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password for security
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit">Change Password</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Data Export
                    </CardTitle>
                    <CardDescription>
                        Download your financial data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Export all your transactions, budgets, and goals as a CSV file.
                    </p>
                    <Button onClick={handleExportData} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Go to Export Page
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button onClick={handleDeleteAccount} variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
