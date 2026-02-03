# Backend deployment configuration

## Build Command
```
npm install && npx prisma generate && npm run build
```

## Start Command  
```
npm start
```

## Environment Variables (Required)
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT token generation
- `NODE_ENV` - Set to `production`
- `ALLOWED_ORIGINS` - Frontend URL (e.g., https://your-frontend.vercel.app)

## Notes
- Prisma will auto-generate on npm install (postinstall script)
- For production, consider using PostgreSQL instead of SQLite
- Make sure to set all environment variables in hosting platform
