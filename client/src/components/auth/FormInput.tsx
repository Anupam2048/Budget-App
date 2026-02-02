import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FormInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    id?: string;
}

export function FormInput({
    label,
    type,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    id
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="space-y-2">
            <Label htmlFor={inputId} className={error ? 'text-red-600' : ''}>
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={inputId}
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={`pr-10 ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
