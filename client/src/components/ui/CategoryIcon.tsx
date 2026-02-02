import {
    UtensilsCrossed,
    Car,
    ShoppingBag,
    Home,
    Tv,
    Zap,
    Heart,
    MoreHorizontal,
    type LucideIcon
} from 'lucide-react';

type CategoryIconProps = {
    category: string;
    size?: 'sm' | 'md' | 'lg';
    showBackground?: boolean;
    className?: string;
};

const categoryConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
    'Food': {
        icon: UtensilsCrossed,
        color: 'text-orange-600',
        bgColor: 'bg-pastel-orange'
    },
    'Transport': {
        icon: Car,
        color: 'text-blue-600',
        bgColor: 'bg-pastel-blue'
    },
    'Shopping': {
        icon: ShoppingBag,
        color: 'text-purple-600',
        bgColor: 'bg-pastel-purple'
    },
    'Rent': {
        icon: Home,
        color: 'text-green-600',
        bgColor: 'bg-pastel-green'
    },
    'Entertainment': {
        icon: Tv,
        color: 'text-pink-600',
        bgColor: 'bg-pastel-pink'
    },
    'Utilities': {
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-pastel-yellow'
    },
    'Healthcare': {
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
    },
    'Other': {
        icon: MoreHorizontal,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
    },
};

const sizeClasses = {
    sm: { icon: 'h-4 w-4', container: 'h-8 w-8' },
    md: { icon: 'h-5 w-5', container: 'h-10 w-10' },
    lg: { icon: 'h-6 w-6', container: 'h-12 w-12' },
};

export function CategoryIcon({
    category,
    size = 'md',
    showBackground = true,
    className = ''
}: CategoryIconProps) {
    const config = categoryConfig[category] || categoryConfig['Other'];
    const Icon = config.icon;
    const sizes = sizeClasses[size];

    if (!showBackground) {
        return <Icon className={`${sizes.icon} ${config.color} ${className}`} />;
    }

    return (
        <div className={`${sizes.container} ${config.bgColor} rounded-full flex items-center justify-center ${className}`}>
            <Icon className={`${sizes.icon} ${config.color}`} />
        </div>
    );
}
