export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 mt-auto bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                    SpendZen
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Spend smarter. Save better.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    © {currentYear} SpendZen. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
