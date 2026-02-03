import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function PremiumPage() {
    const features = [
        { name: 'Advanced Analytics', free: true, premium: true },
        { name: 'Budget Tracking', free: true, premium: true },
        { name: 'EMI Management', free: true, premium: true },
        { name: 'Subscriptions Tracking', free: true, premium: true },
        { name: 'AI-Powered Insights', free: 'Limited', premium: 'Unlimited' },
        { name: 'Export Reports (CSV)', free: 'Monthly', premium: 'Anytime' },
        { name: 'Multi-Currency Support', free: false, premium: true },
        { name: 'Investment Tracking', free: false, premium: true },
        { name: 'Tax Planning Tools', free: false, premium: true },
        { name: 'Priority Support', free: false, premium: true },
        { name: 'Custom Categories', free: '5', premium: 'Unlimited' },
        { name: 'Data History', free: '6 months', premium: 'Lifetime' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Crown className="w-10 h-10 text-amber-500" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                        SpendZen Premium
                    </h1>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Unlock the full potential of your financial management with advanced features
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <Card className="p-8 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold">Free</h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-5xl font-bold">₹0</span>
                                <span className="text-gray-600 dark:text-gray-400">/month</span>
                            </div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Perfect for getting started with budget tracking
                            </p>
                        </div>
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
                        </Button>
                        <div className="space-y-3">
                            <p className="font-semibold text-sm">What's included:</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm">Basic budget tracking & expense management</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm">EMI & subscription management</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm">Limited AI insights (5/month)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm">Monthly CSV export</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm">6 months data history</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Premium Plan */}
                <Card className="p-8 border-2 border-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                            <Sparkles className="w-3 h-3" />
                            POPULAR
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Premium
                            </h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    ₹299
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">/month</span>
                            </div>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">
                                For serious financial planning & wealth building
                            </p>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                        </Button>
                        <div className="space-y-3">
                            <p className="font-semibold text-sm">Everything in Free, plus:</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Unlimited AI-powered insights</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Export reports anytime (CSV, PDF)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Multi-currency support (USD, EUR, GBP)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Investment portfolio tracking</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Tax planning & optimization tools</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Unlimited custom categories</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Lifetime data history</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Priority email support</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-6">Detailed Comparison</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Feature</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold">Free</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                                    Premium
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {features.map((feature, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-sm">{feature.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        {typeof feature.free === 'boolean' ? (
                                            feature.free ? (
                                                <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{feature.free}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5">
                                        {typeof feature.premium === 'boolean' ? (
                                            feature.premium ? (
                                                <Check className="w-5 h-5 text-amber-500 mx-auto" />
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )
                                        ) : (
                                            <span className="text-sm font-medium text-amber-600 dark:text-amber-500">{feature.premium}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Coming Soon Banner */}
            <Card className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-2 border-blue-200 dark:border-blue-800">
                <div className="text-center space-y-4">
                    <Sparkles className="w-12 h-12 mx-auto text-blue-500" />
                    <h3 className="text-2xl font-bold">Payment Integration Coming Soon!</h3>
                    <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
                        We're working on integrating secure payment processing. In the meantime, enjoy all the free features of SpendZen!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This is a portfolio demonstration project. No actual payments will be processed.
                    </p>
                </div>
            </Card>
        </div>
    );
}
