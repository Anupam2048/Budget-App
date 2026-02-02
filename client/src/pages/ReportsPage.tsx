import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { Calendar } from 'lucide-react';

export default function ReportsPage() {
    const { symbol } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    // Default to last 6 months
    const getDefaultStartDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        return date.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await analyticsAPI.getReports({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterApply = () => {
        fetchReports();
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        // Will fetch all-time data
        setTimeout(() => fetchReports(), 100);
    };

    const handleDownloadReport = async () => {
        try {
            setDownloading(true);
            const response = await analyticsAPI.downloadReport({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const dateRange = startDate && endDate
                ? `${startDate}_to_${endDate}`
                : 'All_Time';
            link.download = `Budget_Report_${dateRange}.pdf`;

            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading reports...</div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">No data available</div>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

    // Prepare data for pie chart
    const categoryData = reportData.expenseByCategory.map((item: any) => ({
        name: item.category,
        value: item.amount,
    }));

    // Prepare data for bar chart
    const monthlyData = reportData.incomeVsExpenseTrend || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
            </div>

            {/* Date Filter Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Date Range Filter
                    </CardTitle>
                    <CardDescription>
                        Filter reports by date range (leave empty for all-time data)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleFilterApply}>Apply Filter</Button>
                        <Button variant="outline" onClick={handleClearFilter}>Clear Filter</Button>
                        <Button
                            variant="default"
                            onClick={handleDownloadReport}
                            disabled={downloading || loading}
                            className="ml-auto"
                        >
                            {downloading ? 'Generating PDF...' : 'Download PDF Report'}
                        </Button>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Showing data from: <strong>{reportData.period.start}</strong> to <strong>{reportData.period.end}</strong>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {symbol}{reportData.totalIncome.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {symbol}{reportData.totalExpense.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {symbol}{reportData.balance.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <CardDescription>Monthly comparison</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {monthlyData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No monthly data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>Where your money goes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {categoryData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No expense categories yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `${symbol}${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
