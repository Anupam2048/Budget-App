export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 mt-auto">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm text-gray-500">
                    © {currentYear} BudgetPlanner. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
