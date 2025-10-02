# Railway Deployment Guide - The Ember Society

This guide walks through deploying The Ember Society to Railway.app.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- Railway CLI installed (optional but recommended): `npm i -g @railway/cli`
- Google OAuth credentials
- Facebook OAuth credentials
- VAPID keys for push notifications

## Architecture Overview

The application consists of two main services:
1. **API Service** - Express.js backend with Socket.IO
2. **Web Service** - React frontend (Vite)
3. **Database** - PostgreSQL (Railway managed)

## Step 1: Create Railway Project

```bash
# Login to Railway (if using CLI)
railway login

# Create new project
railway init
```

Or create a new project through the Railway dashboard.

## Step 2: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a PostgreSQL database
3. Note the connection string from the "Connect" tab

## Step 3: Deploy API Service

### 3.1 Create API Service

1. Click "New" → "Empty Service"
2. Name it "api"
3. Connect your GitHub repository
4. Set root directory to `/`
5. Railway will detect `apps/api/nixpacks.toml` automatically

### 3.2 Configure API Environment Variables

Add these environment variables to the API service:

```bash
# Database (Railway will auto-inject DATABASE_URL from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server
PORT=3000
NODE_ENV=production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-api-domain.railway.app/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-api-domain.railway.app/api/auth/facebook/callback

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_jwt_secret

# VAPID Keys (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# CORS (comma-separated)
CORS_ORIGIN=https://your-web-domain.railway.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 3.3 Link Database to API

1. In API service settings, go to "Variables" tab
2. Click "New Variable" → "Add Reference"
3. Select the PostgreSQL database
4. Add `DATABASE_URL` reference

## Step 4: Deploy Web Service

### 4.1 Create Web Service

1. Click "New" → "Empty Service"
2. Name it "web"
3. Connect the same GitHub repository
4. Set root directory to `/`
5. Railway will detect `apps/web/nixpacks.toml` automatically

### 4.2 Configure Web Environment Variables

Add these environment variables to the Web service:

```bash
# API Configuration (use the public domain of your API service)
VITE_API_URL=https://your-api-domain.railway.app

# WebSocket Configuration
VITE_SOCKET_URL=https://your-api-domain.railway.app

# VAPID Public Key (same as API service)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Step 5: Generate VAPID Keys

Run this command locally to generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

Copy the public and private keys to both API and Web service environment variables.

## Step 6: Configure OAuth Callbacks

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-api-domain.railway.app/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for local dev)

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Navigate to your app settings
3. Add OAuth redirect URIs:
   - `https://your-api-domain.railway.app/api/auth/facebook/callback`
   - `http://localhost:3000/api/auth/facebook/callback` (for local dev)

## Step 7: Deploy Services

Railway will automatically deploy when you push to your connected branch.

### Manual Deployment (using CLI)

```bash
# Deploy API
railway up --service api

# Deploy Web
railway up --service web
```

## Step 8: Database Migration

Railway will automatically run migrations on API startup via the nixpacks configuration:

```toml
[start]
cmd = "npx prisma migrate deploy && npm start"
```

To manually run migrations:

```bash
railway run --service api npx prisma migrate deploy
```

## Step 9: Custom Domain (Optional)

### For API Service
1. Go to API service → Settings → Domains
2. Click "Add Custom Domain"
3. Follow DNS configuration instructions

### For Web Service
1. Go to Web service → Settings → Domains
2. Click "Add Custom Domain"
3. Follow DNS configuration instructions
4. Update API service CORS_ORIGIN to include custom domain
5. Update Web service VITE_API_URL to use API custom domain

## Monitoring & Logs

View real-time logs for each service:

```bash
# API logs
railway logs --service api

# Web logs
railway logs --service web
```

Or view logs in the Railway dashboard under each service.

## Troubleshooting

### Database Connection Issues

Ensure `DATABASE_URL` is properly linked from PostgreSQL service to API service.

### Build Failures

Check the build logs in Railway dashboard. Common issues:
- Missing environment variables
- Node.js version mismatch (ensure Node 20+ as specified in package.json)
- TypeScript compilation errors

### OAuth Redirect Issues

Verify callback URLs match exactly in:
1. OAuth provider settings (Google/Facebook)
2. Railway environment variables
3. Frontend redirect logic

### Socket.IO Connection Issues

Ensure:
- `VITE_SOCKET_URL` matches API domain
- CORS is properly configured on API
- Both HTTP and WebSocket protocols are allowed

## Scaling

Railway automatically handles scaling. For production:

1. **API Service**: Consider increasing replicas in high-traffic scenarios
2. **Database**: Monitor connection pool usage, upgrade plan if needed
3. **Web Service**: Static files are served via CDN, scales automatically

## Cost Optimization

- Use Railway's sleep feature for non-production environments
- Monitor usage in Railway dashboard
- Consider upgrading to Railway Pro for production workloads

## Security Checklist

- [ ] JWT_SECRET is a strong random string
- [ ] OAuth credentials are valid and callback URLs are correct
- [ ] CORS_ORIGIN only includes trusted domains
- [ ] Environment variables are properly set (not hardcoded)
- [ ] Database connection uses SSL (default on Railway)
- [ ] File upload size limits are configured
- [ ] VAPID keys are unique and not shared

## Next Steps After Deployment

1. Test OAuth login flows
2. Verify push notifications work
3. Test file uploads
4. Monitor error logs
5. Set up custom domains
6. Configure monitoring/alerts (Railway supports webhook notifications)

## Useful Commands

```bash
# Open Railway dashboard for project
railway open

# View environment variables
railway variables

# Connect to PostgreSQL database
railway connect Postgres

# Run Prisma Studio
railway run --service api npx prisma studio

# Restart service
railway restart --service api
```

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: [Your GitHub Issues URL]
