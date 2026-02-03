import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, PiggyBank, PieChart, LineChart, BrainCircuit, Settings, LogOut, Menu, CreditCard, Repeat, Crown } from 'lucide-react';
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
        { name: 'Expenses', href: '/expenses', icon: PiggyBank },
        { name: 'Budgets', href: '/budgets', icon: PieChart },
        { name: 'EMI', href: '/emi', icon: CreditCard },
        { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
        { name: 'Reports', href: '/reports', icon: LineChart },
        { name: 'AI Insights', href: '/insights', icon: BrainCircuit },
        { name: 'Premium', href: '/premium', icon: Crown, highlight: true },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar for Desktop */}
            <aside className="hidden w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <img src="/spendzen-logo.png" alt="SpendZen" className="w-8 h-8" />
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">SpendZen</h1>
                            <p className="text-xs text-gray-500">Spend smarter. Save better.</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                location.pathname === item.href
                                    ? item.highlight
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                        : "bg-primary text-primary-foreground"
                                    : item.highlight
                                        ? "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
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
                    <div className="flex items-center gap-2">
                        <img src="/spendzen-logo.png" alt="SpendZen" className="w-7 h-7" />
                        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">SpendZen</h1>
                    </div>
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
                                            ? item.highlight
                                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                                : "bg-primary text-primary-foreground"
                                            : item.highlight
                                                ? "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
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
