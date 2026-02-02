/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Financial category colors
                income: {
                    DEFAULT: "#10b981", // emerald-500
                    light: "#d1fae5",   // emerald-100
                    dark: "#047857",    // emerald-700
                },
                expense: {
                    DEFAULT: "#ef4444", // red-500
                    light: "#fee2e2",   // red-100
                    dark: "#b91c1c",    // red-700
                },
                balance: {
                    DEFAULT: "#3b82f6", // blue-500
                    light: "#dbeafe",   // blue-100
                    dark: "#1d4ed8",    // blue-700
                },
                // Soft pastel palette for categories
                pastel: {
                    yellow: "#fef3c7",  // amber-100
                    blue: "#dbeafe",    // blue-100
                    green: "#d1fae5",   // emerald-100
                    purple: "#e9d5ff",  // purple-100
                    pink: "#fce7f3",    // pink-100
                    orange: "#fed7aa",  // orange-100
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-financial': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
}
