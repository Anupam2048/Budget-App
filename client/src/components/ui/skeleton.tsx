export const Skeleton = ({ className = '' }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-muted rounded ${className}`} />
    );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-20" />
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
};
