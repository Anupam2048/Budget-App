# Backend 500 Error - Verification Steps

## Step 1: Check Backend Terminal NOW

Look at the terminal where you ran `npm run dev` (backend).

When you try to add a subscription, you should see an error like:

**Likely Error Messages:**
```
Error creating subscription: PrismaClientKnownRequestError: 
Invalid `prisma.subscription.create()` invocation:
The table `main.Subscription` does not exist in the current database.
```

OR

```
Error creating subscription: PrismaClientInitializationError:
Prisma Client could not locate the Query Engine for runtime "windows".
```

**Action**: Copy the FULL error message from backend terminal and send it to me.

---

## Step 2: Verify Database File Exists

1. Open File Explorer
2. Navigate to: `c:\Users\yanup\Downloads\Budget App\server`
3. Look for a file called `dev.db`

**If dev.db does NOT exist:**
- Database was never created
- Prisma db push didn't run successfully

**If dev.db DOES exist:**
- Tables might be missing
- Need to check with prisma studio

---

## Step 3: Manual Database Creation

Open **Command Prompt** (CMD, not PowerShell) and run:

```cmd
cd "c:\Users\yanup\Downloads\Budget App\server"
```

Then run EACH command separately:

```cmd
npx prisma generate
```
Wait for "Generated Prisma Client" message.

```cmd
npx prisma db push
```
Wait for "Your database is now in sync with your schema" message.

**If you get PowerShell errors**, you MUST use CMD, not PowerShell.

---

## Step 4: Verify Tables Were Created

After db push, run:
```cmd
npx prisma studio
```

This opens a browser showing your database.

**Check if these tables exist:**
- User
- Income
- Expense
- Budget
- SavingsGoal
- EMI ← This one!
- Subscription ← This one!

If EMI and Subscription tables are missing, the schema didn't apply.

---

## Step 5: Restart Backend

After database is created:
```cmd
# Stop current server (Ctrl+C)
npm run dev
```

---

## Please Tell Me:

1. **Does `dev.db` file exist?** (Check file explorer)
2. **Backend error message?** (Full text from terminal)
3. **Did `npx prisma db push` work?** (What output did it show?)
4. **Are you using CMD or PowerShell?** (PowerShell won't work due to execution policy)

With this info, I can give you the exact fix!
