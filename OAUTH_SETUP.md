# OAuth Setup Guide - The Ember Society

Complete guide to setting up Google and Facebook OAuth authentication.

---

## Overview

SSO (Single Sign-On) integration allows users to sign in with their existing Google or Facebook accounts. This guide covers:

1. Creating OAuth applications
2. Configuring environment variables
3. Testing the integration
4. Troubleshooting common issues

---

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`

---

## Google OAuth Setup

### Step 1: Create Google OAuth Application

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (if you don't have one)
   - Click "Select a project" → "New Project"
   - Name: "The Ember Society"
   - Click "Create"

3. **Enable Google+ API** (optional, for profile data)
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for testing)
   - Click "Create"

   **Fill in required fields:**
   - App name: `The Ember Society`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"

5. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Update" → "Save and Continue"

6. **Add Test Users** (for development)
   - Add your email addresses
   - Click "Save and Continue"

7. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "The Ember Society Web"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   ```

   - Click "Create"
   - **Copy Client ID and Client Secret** (you'll need these!)

### Step 2: Configure Environment Variables

In `apps/api/.env` (create from `.env.example`):

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Step 3: Test Google OAuth

1. **Restart your backend server** (if running):
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Navigate to login page**:
   - http://localhost:5173/login

3. **Click "Google" button**
   - You should be redirected to Google's login page
   - Select your test account
   - Grant permissions
   - You should be redirected back to `/feed` (after `/auth/callback`)

---

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/

2. **Create an App**
   - Click "My Apps" → "Create App"
   - Use case: "Other"
   - App type: "Consumer"
   - Click "Next"

3. **App Details**
   - App name: "The Ember Society"
   - App contact email: Your email
   - Click "Create App"

4. **Add Facebook Login Product**
   - In the dashboard, find "Facebook Login"
   - Click "Set Up"
   - Choose "Web"
   - Site URL: `http://localhost:5173`
   - Click "Save" → "Continue"

5. **Configure Facebook Login Settings**
   - Go to "Facebook Login" → "Settings" (in left sidebar)

   **Valid OAuth Redirect URIs:**
   ```
   http://localhost:3000/api/auth/facebook/callback
   ```

   - Click "Save Changes"

6. **Get App Credentials**
   - Go to "Settings" → "Basic" (in left sidebar)
   - **Copy App ID**
   - Click "Show" next to App Secret
   - **Copy App Secret**

7. **Add Test Users** (for development)
   - Go to "Roles" → "Test Users"
   - Click "Add" to create test users
   - Or add your personal Facebook account as a test user

### Step 2: Configure Environment Variables

In `apps/api/.env`:

```bash
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

### Step 3: Test Facebook OAuth

1. **Restart your backend server**:
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Navigate to login page**:
   - http://localhost:5173/login

3. **Click "Facebook" button**
   - You should be redirected to Facebook's login page
   - Login with your test user
   - Grant permissions (email is required)
   - You should be redirected back to `/feed`

---

## Complete .env Example

`apps/api/.env`:

```bash
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ember_society

# JWT
JWT_SECRET=super-secret-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# OAuth - Google
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## How OAuth Flow Works

### User Journey

1. **User clicks "Google" or "Facebook" button on login page**
2. **Browser redirects to OAuth provider** (Google/Facebook)
3. **User logs in and grants permissions**
4. **OAuth provider redirects back to API callback URL** with authorization code
5. **API exchanges code for user profile data**
6. **API checks if user exists:**
   - If yes: Update Google/Facebook ID and login
   - If no: Create new user with profile data
7. **API generates JWT token**
8. **API redirects to frontend** `/auth/callback?token=...`
9. **Frontend stores token in localStorage**
10. **Frontend redirects to** `/feed`

### Database Logic

**New User (First-time OAuth)**:
```
1. Extract email from OAuth profile
2. Check if email exists in database
   - If yes: Link OAuth ID to existing account
   - If no: Create new user with:
     - Email (verified)
     - Generated username (from email)
     - Display name (from OAuth profile)
     - Avatar URL (from OAuth profile)
     - googleId or facebookId
```

**Returning User**:
```
1. Find user by googleId or facebookId
2. Update lastLoginAt timestamp
3. Generate new JWT token
```

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- **Cause**: Callback URL doesn't match Google Console settings
- **Fix**: Ensure `http://localhost:3000/api/auth/google/callback` is in "Authorized redirect URIs"

**Error: "Access blocked: This app's request is invalid"**
- **Cause**: Missing or invalid scopes
- **Fix**: Add `.../auth/userinfo.email` and `.../auth/userinfo.profile` scopes

**Error: "This app is blocked"**
- **Cause**: App not verified (normal in development)
- **Fix**: Click "Advanced" → "Go to [app name] (unsafe)" for testing

### Facebook OAuth Issues

**Error: "Can't Load URL: The domain of this URL isn't included in the app's domains"**
- **Cause**: Redirect URI not whitelisted
- **Fix**: Add `http://localhost:3000/api/auth/facebook/callback` to "Valid OAuth Redirect URIs"

**Error: "App Not Set Up: This app is still in development mode"**
- **Cause**: App is in development mode (normal)
- **Fix**: Add yourself as a test user or app admin

**Missing email from Facebook**
- **Cause**: User denied email permission or email not available
- **Fix**: Request explicit email permission in scope (already configured)

### General Issues

**"Unable to create or find user" error**
- **Cause**: User profile doesn't have email
- **Fix**: Email is required. Check OAuth provider returns email.

**Token not saving in frontend**
- **Cause**: Frontend not receiving token
- **Fix**: Check browser console and network tab for redirect URL

**CORS errors**
- **Cause**: Frontend and backend on different origins
- **Fix**: Already configured in `apps/api/src/index.ts` with `cors()` middleware

---

## Production Deployment

When deploying to production (Railway):

### Google OAuth

1. **Update Authorized Origins**:
   ```
   https://your-production-domain.com
   https://api.your-production-domain.com
   ```

2. **Update Redirect URIs**:
   ```
   https://api.your-production-domain.com/api/auth/google/callback
   ```

3. **Update Environment Variables** on Railway:
   ```
   GOOGLE_CALLBACK_URL=https://api.your-production-domain.com/api/auth/google/callback
   FRONTEND_URL=https://your-production-domain.com
   ```

### Facebook OAuth

1. **Update Valid OAuth Redirect URIs**:
   ```
   https://api.your-production-domain.com/api/auth/facebook/callback
   ```

2. **Move app to Live Mode**:
   - Complete App Review (if needed)
   - Enable "Login" product for production

3. **Update Environment Variables** on Railway:
   ```
   FACEBOOK_CALLBACK_URL=https://api.your-production-domain.com/api/auth/facebook/callback
   FRONTEND_URL=https://your-production-domain.com
   ```

### Security Checklist

- ✅ Use strong JWT_SECRET (min 32 characters, random)
- ✅ Use HTTPS in production
- ✅ Never commit `.env` files to version control
- ✅ Rotate secrets regularly
- ✅ Implement rate limiting on auth endpoints
- ✅ Add CSRF protection
- ✅ Validate all user input

---

## Testing Checklist

- [ ] Google OAuth login creates new user
- [ ] Google OAuth login works for existing user
- [ ] Facebook OAuth login creates new user
- [ ] Facebook OAuth login works for existing user
- [ ] OAuth linking: Google account links to existing email
- [ ] OAuth linking: Facebook account links to existing email
- [ ] JWT token is generated and stored
- [ ] User is redirected to /feed after successful login
- [ ] Error handling: Invalid OAuth code
- [ ] Error handling: User denies permissions

---

## Future: Instagram OAuth

Instagram OAuth requires:
1. **Facebook Developer Account** (Instagram is owned by Facebook)
2. **Business verification** (requires business documentation)
3. **Instagram Basic Display API** or **Instagram Graph API**
4. **Longer approval process** (weeks to months)

**Not recommended for MVP.** Can be added later once the platform has traction.

---

## Support

If you encounter issues not covered here:

1. Check backend logs: `cd apps/api && npm run dev`
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure database is running and accessible
5. Test OAuth endpoints directly:
   - http://localhost:3000/api/auth/google
   - http://localhost:3000/api/auth/facebook
