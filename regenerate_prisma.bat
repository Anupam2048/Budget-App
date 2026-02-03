@echo off
echo Regenerating Prisma Client for SpendZen...
cd server
call npm install
call npx prisma generate
call npx prisma db push
echo Done!
pause
