@echo off
echo Starting Personal Budget Planner...

start "Budget App Server" cmd /k "cd server && npm run dev"
start "Budget App Client" cmd /k "cd client && npm run dev"

echo Application started!
echo Server running on http://localhost:5000
echo Client running on http://localhost:5173
