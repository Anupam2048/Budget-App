import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, PiggyBank, PieChart, LineChart, BrainCircuit, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import Footer from './Footer';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Incomes', href: '/incomes', icon: Wallet },
        { name: 'Expenses', href: '/expenses', icon: PiggyBank }, // Using PiggyBank as a placeholder/metaphor or maybe CreditCard
        { name: 'Budgets', href: '/budgets', icon: PieChart },
        { name: 'Reports', href: '/reports', icon: LineChart },
        { name: 'AI Insights', href: '/insights', icon: BrainCircuit },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar for Desktop */}
            <aside className="hidden w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-primary">BudgetPlanner</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                location.pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:hidden">
                    <h1 className="text-xl font-bold text-primary">BudgetPlanner</h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <nav className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                        location.pathname === item.href
                                            ? "bg-primary text-primary-foreground"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            ))}
                            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </Button>
                        </nav>
                    </div>
                )}

                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>

                {/* Copyright Footer */}
                <Footer />
            </div>
        </div>
    );
}
