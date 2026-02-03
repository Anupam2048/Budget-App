import { Lock, Crown } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

type FeatureLockProps = {
    feature: string;
    size?: "sm" | "md" | "lg";
    variant?: "inline" | "overlay" | "badge";
};

export function FeatureLock({ feature, size = "md", variant = "inline" }: FeatureLockProps) {
    const navigate = useNavigate();

    if (variant === "badge") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-semibold">
                <Crown className="w-3 h-3" />
                PRO
            </span>
        );
    }

    if (variant === "overlay") {
        return (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center space-y-3 p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">{feature}</h3>
                        <p className="text-sm text-muted-foreground">Upgrade to Premium to unlock</p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        onClick={() => navigate("/premium")}
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                    </Button>
                </div>
            </div>
        );
    }

    // Inline variant
    const sizeClasses = {
        sm: "gap-1 text-xs",
        md: "gap-2 text-sm",
        lg: "gap-3 text-base"
    };

    const iconSize = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    };

    return (
        <div className={`inline-flex items-center ${sizeClasses[size]} text-muted-foreground`}>
            <Lock className={iconSize[size]} />
            <span>Premium Feature</span>
        </div>
    );
}
