# Frontend Deployment Configuration

## Build Command
```
npm run build
```

## Output Directory
```
dist
```

## Install Command
```
npm install
```

## Environment Variables (Required)
Create a `.env.production` file or set in your hosting platform:

```
VITE_API_URL=https://your-backend-url.render.com
```

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set Framework Preset: `Vite`
3. Set Environment Variable: `VITE_API_URL`
4. Deploy!

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variable: `VITE_API_URL`

### Cloudflare Pages
1. Build command: `npm run build`
2. Build output directory: `dist`
3. Set environment variable: `VITE_API_URL`

## Notes
- Make sure VITE_API_URL points to your deployed backend
- No trailing slash in VITE_API_URL
- Build will fail if there are TypeScript errors
