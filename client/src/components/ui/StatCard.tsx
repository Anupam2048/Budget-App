import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';
import { useEffect, useState } from 'react';

type StatCardProps = {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    iconColor?: string;
    gradient?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
};

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconColor = 'text-blue-500',
    gradient = false,
    trend = 'neutral',
    className = '',
}: StatCardProps) {
    const [displayValue, setDisplayValue] = useState<string | number>(0);

    // Animate number counting for numeric values
    useEffect(() => {
        if (typeof value === 'number') {
            let start = 0;
            const end = value;
            const duration = 1000; // 1 second
            const increment = end / (duration / 16); // 60fps

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayValue(end);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        } else {
            setDisplayValue(value);
        }
    }, [value]);

    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600',
    };

    return (
        <Card
            className={`hover-lift overflow-hidden ${gradient ? 'bg-gradient-to-br from-white to-slate-50' : ''} ${className}`}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                    {displayValue}
                </div>
                {description && (
                    <p className={`text-xs mt-1 ${trendColors[trend]}`}>
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
