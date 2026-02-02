import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, Download } from "lucide-react";

export default function InsightsPage() {
    const insights = [
        {
            id: 1,
            type: 'warning',
            title: 'High Spending Alert',
            message: 'You have spent 80% of your budget for "Dining Out" this month. Consider cooking at home for the next week.',
            icon: AlertTriangle,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/10'
        },
        {
            id: 2,
            type: 'tip',
            title: 'Savings Opportunity',
            message: 'Based on your income, you could increase your monthly savings goal for "Emergency Fund" by $200.',
            icon: Lightbulb,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/10'
        },
        {
            id: 3,
            type: 'trend',
            title: 'Positive Trend',
            message: 'Your utility bills are 15% lower than last month. Great job conserving energy!',
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/10'
        }
    ];

    const handleExport = () => {
        // Mock export functionality
        const csvContent = "data:text/csv;charset=utf-8,Date,Category,Amount\n2023-10-01,Food,120\n2023-10-05,Rent,1500";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
            </div>

            <div className="grid gap-4">
                {insights.map((insight) => (
                    <Card key={insight.id} className="overflow-hidden">
                        <div className="flex items-start p-6">
                            <div className={`p-3 rounded-full mr-4 ${insight.bg}`}>
                                <insight.icon className={`w-6 h-6 ${insight.color}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{insight.title}</h3>
                                <p className="text-muted-foreground">{insight.message}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
