# 🔧 Blank Screen Troubleshooting Guide

## Issue: Blank White Screen on localhost:5173

### Quick Checks

1. **Is the frontend server running?**
   - Open a new terminal (Command Prompt or PowerShell)
   - Navigate to: `cd "c:\Users\yanup\Downloads\Budget App\client"`
   - Run: `npm run dev`
   - Should see: `VITE vX.X.X ready in XXXms` and `Local: http://localhost:5173/`

2. **Is the backend server running?**
   - Open another terminal
   - Navigate to: `cd "c:\Users\yanup\Downloads\Budget App\server"`
   - Run: `npm run dev`
   - Should see: `Server running on port 5000`

### PowerShell Execution Policy Issue

If you see: `running scripts is disabled on this system`

**Fix (Run as Administrator)**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running `npm run dev` again.

### Browser Console Errors

1. Open the browser
2. Press `F12` or `Ctrl+Shift+I`
3. Click "Console" tab
4. Look for RED errors

**Common Errors & Fixes:**

#### Error: "Failed to fetch" or "Network Error"
**Cause**: Backend not running  
**Fix**: Start backend with `npm run dev` in server folder

#### Error: "Unexpected token '<'" or "SyntaxError"
**Cause**: Build issue  
**Fix**: 
```bash
cd client
rm -rf node_modules
npm install
npm run dev
```

#### Error: "Cannot find module"
**Cause**: Missing dependency  
**Fix**: Run `npm install` in client folder

#### Error: "process is not defined"
**Cause**: Using `process.env` instead of `import.meta.env`
**Fix**: Check `api.ts` - should use `import.meta.env.VITE_API_URL`

### Check Network Tab

1. Press `F12`
2. Click "Network" tab
3. Refresh page
4. Look for RED/failed requests

**Common Issues:**
- `localhost:5000` requests failing → Backend not running
- `404` errors → API endpoint mismatch

### Manual Debugging Steps

1. **Check if `.env` exists**:
   - Location: `c:\Users\yanup\Downloads\Budget App\client\.env`
   - Should contain: `VITE_API_URL=http://localhost:5000`

2. **Verify both servers are running**:
   - Frontend: http://localhost:5173 (Vite)
   - Backend: http://localhost:5000 (Express)

3. **Test backend directly**:
   - Open browser
   - Go to: http://localhost:5000/health (if route exists)
   - Or: http://localhost:5000/api/v1/analytics/dashboard
   - Should see JSON response (may show auth error, that's OK)

### Still Not Working?

**Check specific files for errors:**

1. Open `client/src/main.tsx` - any syntax errors?
2. Open `client/src/App.tsx` - imports correct?
3. Open browser console - copy/paste the full error message

### Quick Test

Try this in a new terminal:
```bash
# Test if Node is working
node -v

# Test if npm is working
npm -v

# Navigate to client
cd "c:\Users\yanup\Downloads\Budget App\client"

# Check if node_modules exists
dir node_modules

# If not, install:
npm install

# Then run dev server
npm run dev
```

### Emergency: Use CMD instead of PowerShell

If PowerShell keeps blocking:
1. Open CMD (not PowerShell)
2. Navigate to client folder
3. Run `npm run dev`

---

## What to Report

If still blank, please provide:
1. Screenshot of browser console (F12)
2. Terminal output from `npm run dev`
3. Any RED error messages
