# 💎 SpendZen - Spend Smarter. Save Better.

Your personal finance management companion built with React, TypeScript, Node.js, and Prisma. Track income, expenses, EMIs, subscriptions, and get AI-powered financial insights to make smarter money decisions.

![SpendZen](https://img.shields.io/badge/version-1.0.0-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-cyan.svg)
![Stack](https://img.shields.io/badge/Stack-Full--Stack%20TypeScript-blue.svg)

---

## ✨ What is SpendZen?

SpendZen is a comprehensive personal finance management application designed to help you take control of your finances. Whether you're tracking daily expenses, managing loan EMIs, monitoring subscriptions, or planning budgets - SpendZen provides the tools and insights you need to build better financial habits.

## ✨ Features

### 📊 Dashboard
- **Real-time financial overview** with dynamic stat cards
- Visual comparison of income vs expenses
- Budget tracking with progress indicators
- Recent transaction history
- Quick summary of financial health

### 💸 Income & Expense Management
- Add, edit, and delete income/expense transactions
- Category-based organization
- Date filtering and advanced search
- Bulk operations support
- Real-time balance calculations

### 💳 EMI Tracking
- Manage loan EMIs (Car Loan, Home Loan, Personal Loan, etc.)
- Track monthly EMI amounts and due dates
- View total loan amounts and repayment periods
- **Due date alerts** - Visual warnings for EMIs due within 7 days
- Calculate total monthly EMI obligations

### 🔄 Subscription Management
- Track recurring subscriptions (Netflix, Spotify, Amazon Prime, etc.)
- Support for monthly and yearly billing cycles
- Next billing date tracking
- **Upcoming billing alerts**
- Popular service auto-suggestions
- Total monthly and yearly subscription cost summaries

### 🎯 Budget Management
- Set category-wise monthly budgets
- Real-time budget vs actual tracking
- Visual progress bars with color-coded alerts:
  - 🟢 Green: < 80% (On track)
  - 🟡 Yellow: 80-99% (Warning)
  - 🔴 Red: ≥ 100% (Over budget)
- Budget recommendations and insights

### 🤖 AI-Powered Insights
- **Intelligent spending analysis**
- Month-over-month spending comparisons
- Top spending category identification
- Savings rate calculations
- Personalized financial recommendations
- AI-generated action items

### 📈 Reports & Analytics
- Comprehensive financial reports
- Date range filtering
- **CSV Export functionality**
- Category-wise expense breakdowns
- Income vs expense comparisons
- Trend analysis and visualizations

### 👑 Premium Features (UI Demo)
- Feature comparison table (Free vs Premium)
- Premium upgrade page with pricing
- Mock monetization UI (no actual payment processing)
- Premium badge in navigation

### ⚙️ Settings
- **Multi-currency support** (USD, EUR, GBP, INR, JPY, AUD, CAD, CHF)
- Profile customization
- Currency preference selection
- Account management

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for modern, responsive styling
- **Recharts** for data visualizations
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **SQLite** (development) / **PostgreSQL** (production-ready)
- **JWT** for secure authentication
- **bcryptjs** for password hashing

### Database
- **Prisma** schema with:
  - User authentication
  - Income & Expense tracking
  - Budget & Savings Goals
  - EMI management
  - Subscription tracking
  - Notifications

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd "Budget App"
```

2. **Install dependencies**

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

3. **Set up environment variables**

Backend (.env):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000
```

4. **Initialize database**
```bash
cd server
npm run regenerate_prisma.bat
# Or manually:
# npx prisma generate
# npx prisma db push
```

5. **Run the application**

Backend (in `server` directory):
```bash
npm run dev
```

Frontend (in `client` directory):
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
Budget App/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Currency, etc.)
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EMIPage.tsx
│   │   │   ├── SubscriptionsPage.tsx
│   │   │   ├── InsightsPage.tsx
│   │   │   ├── PremiumPage.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   ├── public/
│   │   └── spendzen-logo.png
│   └── package.json
│
└── server/                # Node.js backend
    ├── src/
    │   ├── controllers/   # Business logic
    │   │   ├── analyticsController.ts
    │   │   ├── emiController.ts
    │   │   ├── subscriptionController.ts
    │   │   └── ...
    │   ├── routes/        # API routes (v1)
    │   ├── middleware/    # Auth, validation
    │   └── index.ts       # Server entry point
    ├── prisma/
    │   └── schema.prisma  # Database schema
    └── package.json
```

---

## 🔒 Authentication

SpendZen uses JWT-based authentication:
- User registration (`/auth/signup`)
- User login (`/auth/login`)
- Protected routes with Bearer token
- Auto token refresh on expiry (redirects to login)

---

## 🌐 API Endpoints (v1)

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

### Transactions
- `GET/POST /api/v1/transactions/incomes` - Manage incomes
- `GET/POST /api/v1/transactions/expenses` - Manage expenses
- `DELETE /api/v1/transactions/:id` - Delete transaction

### Budgets & Goals
- `GET/POST /api/v1/budgets/budgets` - Manage budgets
- `GET/POST /api/v1/budgets/goals` - Manage savings goals

### EMIs
- `GET/POST /api/v1/emis` - List/create EMIs
- `PUT /api/v1/emis/:id` - Update EMI
- `DELETE /api/v1/emis/:id` - Delete EMI

### Subscriptions
- `GET/POST /api/v1/subscriptions` - List/create subscriptions
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `DELETE /api/v1/subscriptions/:id` - Delete subscription

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `GET /api/v1/analytics/reports` - Financial reports
- `GET /api/v1/analytics/insights` - AI-powered insights

### Reports
- `GET /api/v1/reports/download` - Export CSV report

---

## 🎨 Brand Identity

**SpendZen** - Zen for your spending
- **Tagline**: "Spend smarter. Save better."
- **Colors**: 
  - Primary: Emerald (#10B981)
  - Secondary: Cyan (#0EA5E9)
  - Gradients: Emerald → Cyan
- **Logo**: Rupee symbol (₹) with upward growth arrow

---

## 🔮 Planned Features

- [ ] **Investment tracking** - Stocks, mutual funds, crypto
- [ ] **Tax planning** - Deductions calculator, tax estimates
- [ ] **Goal-based savings** - Track progress toward financial goals
- [ ] **Multi-user support** - Family/household budgets
- [ ] **Bank integration** - Auto-import transactions (Plaid/similar)
- [ ] **Mobile app** - Native Android/iOS apps
- [ ] **Bill reminders** - Push notifications for upcoming payments
- [ ] **Expense splitting** - Track shared expenses with roommates/partners
- [ ] **Custom reports** - Build your own financial reports
- [ ] **Dark mode enhancements** - Better dark theme support
- [ ] **Backup & Restore** - Cloud backup of your data

Got a feature request? Open an issue!

---

## 🚢 Deployment

SpendZen is designed to be easily deployable on free hosting platforms:

### Backend Options
- **Render** (Free tier with automatic HTTPS)
- **Railway** (Free tier available)
- **Fly.io** (Free tier available)

### Frontend Options
- **Vercel** (Free for personal projects)
- **Netlify** (Free tier)
- **Cloudflare Pages** (Free)

### Database Options
- **SQLite** (Current - perfect for personal use)
- **PostgreSQL** on Render/Railway (for production scale)
- **MongoDB Atlas** (Free tier - 512MB)

Deployment instructions coming soon!

---

## 📸 Screenshots

*Coming soon - after deployment*

---

## 📄 License

MIT License - Free to use and modify for personal use.

---

## 👨‍💻 About

**SpendZen** is a personal project by Yanup (Anupam) - built to solve real-world personal finance management needs with modern web technologies.

**Why SpendZen?**
- Started as a simple budget tracker
- Evolved into a full-featured money management app
- Built with scalability and real-world usage in mind
- Continuously being improved with new features

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern fintech apps
- Built with TypeScript, React, Node.js, and Prisma

---

**SpendZen** - Your journey to financial zen starts here. 🧘‍♂️💰
