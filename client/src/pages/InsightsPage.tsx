import { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, Download, TrendingDown, CheckCircle2, Sparkles } from "lucide-react";
import { analyticsAPI } from '../lib/api';

interface Insight {
    type: string;
    message: string;
    icon?: string;
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await analyticsAPI.getInsights();
            setInsights(response.data.insights || []);
        } catch (error) {
            console.error('Error fetching insights:', error);
            // Fallback to demo data if API fails
            setInsights([
                {
                    type: 'warning',
                    message: 'Connect to your backend to get personalized AI insights',
                    icon: 'Lightbulb'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await analyticsAPI.downloadReport();
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `spendzen_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    const getInsightIcon = (type: string, iconName?: string) => {
        const icons: { [key: string]: any } = {
            alert: AlertTriangle,
            warning: AlertTriangle,
            success: CheckCircle2,
            info: Lightbulb,
            trend: TrendingUp,
            TrendingUp: TrendingUp,
            TrendingDown: TrendingDown,
            Lightbulb: Lightbulb,
        };

        if (iconName && icons[iconName]) return icons[iconName];
        return icons[type] || Lightbulb;
    };

    const getInsightColor = (type: string) => {
        const colors: { [key: string]: { text: string; bg: string } } = {
            alert: { text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
            warning: { text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
            success: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
            info: { text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/10' },
            trend: { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        };
        return colors[type] || colors.info;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading insights...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-emerald-500" />
                        AI Insights
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Personalized financial recommendations powered by your data
                    </p>
                </div>
                <Button onClick={handleExport} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            {insights.length === 0 ? (
                <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No insights available yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Add more transactions to get personalized insights
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {insights.map((insight, index) => {
                        const InsightIcon = getInsightIcon(insight.type, insight.icon);
                        const colors = getInsightColor(insight.type);

                        return (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-gray-200 dark:border-gray-700">
                                <div className="flex items-start p-6">
                                    <div className={`p-3 rounded-full mr-4 ${colors.bg}`}>
                                        <InsightIcon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1 capitalize">{insight.type} Insight</h3>
                                        <p className="text-muted-foreground">{insight.message}</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pro Tip Section */}
            <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/10 dark:to-cyan-900/10 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                💡 SpendZen Pro Tip
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Review your insights weekly to track spending patterns. Set up budgets for your top 3 expense categories to stay on track with your financial goals!
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
