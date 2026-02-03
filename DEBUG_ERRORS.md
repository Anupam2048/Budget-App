# Quick Debug Steps for EMI/Subscription Errors

## Step 1: Check Backend Console
Look at your backend terminal where `npm run dev` is running.
You should see logs like:
```
[2026-02-03T...] POST /api/v1/emis
Body: { name: '...', amount: ..., dueDate: ... }
```

**What to look for:**
- Is the request even reaching the backend?
- What's the error message in the backend console?
- Any Prisma errors about missing tables?

## Step 2: Check Browser Console
Press F12 in browser, go to Console tab.

**Common errors:**

### "404 Not Found"
- Backend server not running
- Routes still not fixed (need to restart server)

### "Failed to fetch" or "Network Error"  
- Backend server not running on port 5000
- CORS issue

### "400 Bad Request"
- Missing required fields
- Check what data is being sent

### "500 Internal Server Error"
- Database not generated
- Prisma client out of sync

## Step 3: If Database Error

Run these commands:
```cmd
cd server
npx prisma generate
npx prisma db push
```

Then restart server:
```cmd
npm run dev
```

## Step 4: Test Backend Directly

Open your browser and go to:
```
http://localhost:5000
```

Should see:
```json
{
  "message": "SpendZen API is running",
  "version": "1.0",
  "tagline": "Spend smarter. Save better."
}
```

If you DON'T see this, backend isn't running.

## Step 5: Check Network Tab

1. Press F12
2. Go to "Network" tab
3. Try to add an EMI
4. Look for the `emis` request
5. Click on it
6. Check:
   - **Status**: 200 (good), 404 (bad), 500 (bad)
   - **Response**: What error message?
   - **Request Payload**: What data was sent?

## Please Tell Me:

1. **Backend Console**: What does it print when you try to add EMI?
2. **Browser Console Error**: Exact error message (red text)
3. **Network Tab Status**: What's the HTTP status code? (200, 404, 500, etc.)
4. **Did you restart backend?**: After the route fix, did you stop and restart `npm run dev`?

With this info, I can fix the exact issue!
