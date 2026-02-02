# 💰 Personal Budget Planner

A modern, full-stack web application for managing personal finances, tracking income and expenses, setting budgets, and gaining financial insights.

![Budget Planner](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 📊 Dashboard
- Real-time financial overview
- Income vs Expense visualization
- Monthly trend analysis
- Quick stats and insights

### 💵 Income & Expense Tracking
- Add, edit, and delete transactions
- Category-based organization
- Date filtering and search
- Bulk operations support

### 🎯 Budget Management
- Set category-wise budgets
- Real-time budget tracking
- Visual progress indicators
- Overspending alerts

### 📈 Reports & Analytics
- Comprehensive financial reports
- **Downloadable PDF reports** with:
  - Executive summary
  - Income/expense tables
  - Budget performance
  - AI-powered insights
- Date range filtering
- Export functionality

### 🤖 AI Insights
- Intelligent spending analysis
- Personalized recommendations
- Financial health scoring
- Trend predictions

### ⚙️ Settings
- Multi-currency support (USD, EUR, GBP, INR, JPY, AUD, CAD, CHF)
- Profile customization
- Data export/import
- Theme preferences

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide Icons** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Modern ORM
- **SQLite** - Database
- **JWT** - Authentication
- **PDFKit** - PDF generation
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/budget-planner.git
cd budget-planner
```

### Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Client will run on `http://localhost:5174`

## 🗂️ Project Structure

```
budget-planner/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI primitives
│   │   ├── contexts/      # React contexts (Currency)
│   │   ├── lib/           # Utilities and API client
│   │   └── pages/         # Page components
│   └── package.json
│
├── server/                # Backend Express application
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔐 Environment Variables

### Server (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this"
PORT=5000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📱 Usage

1. **Sign Up**: Create a new account with name, email, and password
2. **Log In**: Access your account securely
3. **Add Income/Expenses**: Track all your transactions
4. **Set Budgets**: Define spending limits per category
5. **View Reports**: Analyze your financial health
6. **Download PDF**: Get comprehensive reports
7. **Get Insights**: Receive AI-powered recommendations

## 🎨 Design Highlights

- **Modern Authentication Pages**: Two-card glassmorphism layout
- **Password Strength Indicator**: Real-time validation
- **Inline Error Messages**: User-friendly feedback
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Easy on the eyes
- **Professional Footer**: Dynamic copyright notice

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salt rounds
- **Protected Routes**: Client and server-side protection
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries

## 📊 Database Schema

### User
- id, name, email, password, currency, createdAt

### Income
- id, userId, source, amount, date, createdAt

### Expense
- id, userId, category, amount, date, createdAt

### Budget
- id, userId, category, amount, createdAt

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- UI components inspired by modern fintech applications
- Icons by [Lucide](https://lucide.dev/)
- Built with ❤️ using React and Node.js

---

© 2026 BudgetPlanner. All rights reserved.
