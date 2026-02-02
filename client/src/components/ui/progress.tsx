import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../../lib/utils"

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    variant?: ProgressVariant;
    showLabel?: boolean;
}

const variantClasses: Record<ProgressVariant, string> = {
    default: 'bg-primary',
    success: 'bg-income',
    warning: 'bg-yellow-500',
    danger: 'bg-expense',
};

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    ProgressProps
>(({ className, value, variant = 'default', showLabel = false, ...props }, ref) => (
    <div className="relative">
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={cn(
                    "h-full w-full flex-1 transition-all duration-500 ease-out",
                    variantClasses[variant]
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
        {showLabel && (
            <span
                className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
                style={{ left: `${value || 0}%`, transform: 'translateX(-50%)' }}
            >
                {value}%
            </span>
        )}
    </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
