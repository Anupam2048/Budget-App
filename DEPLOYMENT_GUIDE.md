# SpendZen - Quick Deployment Guide

## 🚀 Deploy to Render + Vercel (Recommended)

### Prerequisites
- GitHub/GitLab account with your code pushed
- Render account (free): https://render.com
- Vercel account (free): https://vercel.com

---

## 📦 Part 1: Deploy Backend to Render

### Step 1: Create Web Service
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `Budget App` repository

### Step 2: Configure Service
```
Name: spendzen-api (or your choice)
Region: Choose closest to you
Branch: main (or your default branch)
Root Directory: server
Runtime: Node
Build Command: npm install && npx prisma generate && npx prisma db push
Start Command: npm start
```

### Step 3: Set Environment Variables
Click "Advanced" and add:
```
PORT=5000
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Important**: 
- Change `JWT_SECRET` to a random string
- You'll update `ALLOWED_ORIGINS` after deploying frontend

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://spendzen-api.onrender.com`)

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the `Budget App` repository

### Step 2: Configure Project
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Set Environment Variable
1. Go to "Environment Variables"
2. Add:
```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com
```
(Use the URL you copied from Render)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

---

## 🔄 Part 3: Update Backend CORS

1. Go back to Render dashboard
2. Find your backend service
3. Go to "Environment"
4. Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```
5. Save changes (service will auto-redeploy)

---

## ✅ Verification

1. Visit your Vercel URL
2. Try to sign up / log in
3. Add some test transactions
4. Check if data persists

---

## 🗄️ Optional: Upgrade to PostgreSQL

For production use with persistent data:

### Render Postgres (Free tier)
1. Create new PostgreSQL database on Render
2. Copy the "Internal Database URL"
3. Update backend `DATABASE_URL` environment variable
4. Update Prisma schema: Change `provider = "sqlite"` to `provider = "postgresql"`
5. Redeploy backend

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs
- Verify all environment variables are set
- Make sure Prisma generate ran successfully

### Frontend can't connect to backend
- Check `VITE_API_URL` is correct (no trailing slash)
- Verify CORS is configured with correct frontend URL
- Check browser console for errors

### Database errors
- For SQLite: File persists across deploys on Render free tier
- For production: Use PostgreSQL
- Check Prisma schema matches your database type

---

## 📱 After Deployment

### Custom Domain (Optional)
- **Vercel**: Add custom domain in project settings
- **Render**: Add custom domain in web service settings

### Monitoring
- Check Render dashboard for backend health
- Monitor Vercel analytics for frontend usage

---

##  💰 Costs

- **Render Free Tier**: 750 hours/month (enough for one app 24/7)
- **Vercel Free Tier**: Unlimited hobby projects
- **Total**: $0/month! 🎉

---

## 🔐 Security Notes

1. Never commit `.env` files
2. Use strong `JWT_SECRET`
3. Enable HTTPS only (both platforms do this by default)
4. Regularly update dependencies

---

**Need help?** Check the logs in Render and Vercel dashboards!
