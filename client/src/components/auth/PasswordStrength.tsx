interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const getStrength = () => {
        if (!password) return { label: '', width: '0%', color: 'bg-gray-300' };
        if (password.length < 6) return { label: 'Weak', width: '33%', color: 'bg-red-500' };
        if (password.length < 10) return { label: 'Medium', width: '66%', color: 'bg-yellow-500' };
        return { label: 'Strong', width: '100%', color: 'bg-green-500' };
    };

    const strength = getStrength();

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                />
            </div>
            <p className="text-xs mt-1 text-gray-600">
                Password strength: <span className="font-medium">{strength.label}</span>
            </p>
        </div>
    );
}
