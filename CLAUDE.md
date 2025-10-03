# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Ember Society** is a social networking platform for pipe tobacco and cigar enthusiasts, built as an npm workspaces monorepo with TypeScript throughout.

### Workspace Structure

```
apps/
├── api/          # Express backend API (Node.js + TypeScript)
└── web/          # React frontend (Vite + TypeScript)
packages/
├── database/     # Prisma schema & generated client
├── types/        # Shared TypeScript type definitions
└── config/       # Shared configuration
```

### Dependency Flow

```
apps/api → @ember-society/database → @prisma/client
apps/api → @ember-society/types
apps/web → @ember-society/types
```

## Essential Commands

### Development

```bash
# Install dependencies (from root)
npm install

# Run all services concurrently
npm run dev

# Run services individually
cd apps/api && npm run dev    # API on :3000 (tsx watch)
cd apps/web && npm run dev    # Frontend on :5173 (Vite)

# Build everything
npm run build

# Clean all node_modules and dist folders
npm run clean
```

### Database Management

All database commands must be run from `packages/database`:

```bash
cd packages/database

# Create new migration
npm run prisma:migrate

# Regenerate Prisma Client after schema changes
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema without migration (dev only)
npm run prisma:push
```

### Build Chain

When building the API, dependencies must be built in order:

```bash
cd apps/api
npm run build
# Internally runs:
# 1. build:deps - Generates Prisma client, builds database + types packages
# 2. build:self - Compiles API TypeScript with tsc --build
```

## Architecture

### Backend (apps/api/)

- **Runtime**: Node.js 20+ with **ESM modules** (not CommonJS)
- **Important**: Use `.js` extensions in import statements even though files are `.ts`
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+ via Prisma ORM
- **Authentication**:
  - **OAuth only** (Google & Facebook via Passport.js)
  - **No email/password authentication**
  - JWT tokens for session management (7-day expiry)
- **Real-time**: Socket.io (dependencies present, implementation pending)
- **File Uploads**: Multer with configurable size limits

### Authentication Flow

1. User initiates OAuth via `/api/auth/google` or `/api/auth/facebook`
2. Passport strategies handle authentication with providers
3. On success, JWT token generated with `{userId, email, username}` payload
4. Frontend receives token via redirect to `/auth/callback?token={jwt}`
5. Subsequent requests use `Authorization: Bearer {token}` header

**Key Files**:
- `apps/api/src/config/passport.ts` - OAuth strategies
- `apps/api/src/services/jwtService.ts` - Token generation/verification
- `apps/api/src/middleware/auth.ts` - Express middleware (`authenticate`, `optionalAuth`)

### API Route Pattern

```typescript
import * as db from '@ember-society/database';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const prisma = db.prisma;
const router = Router();

router.get('/endpoint', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;  // From JWT payload
  const result = await prisma.model.findMany({
    where: { userId },
    include: { relations: true }  // Join related data
  });
  res.json(result);
});

export default router;
```

### API Routes Structure

```
/api/auth/*          - OAuth callbacks (Google/Facebook)
/api/users/*         - User profiles, follow/unfollow, blocking
/api/posts/*         - Feed, create posts, reactions, comments
/api/clubs/*         - Club CRUD, memberships, invitations, roles
/api/events/*        - Calendar events, RSVPs
/api/messages/*      - Direct messaging conversations
/api/notifications/* - Push notifications, preferences
/api/reviews/*       - Tobacco/cigar reviews
/api/reports/*       - Content moderation/reporting
/api/upload/*        - File uploads (images/videos)
```

### Frontend (apps/web/)

- **Framework**: React 18 with TypeScript
- **Build**: Vite 5
- **Routing**: React Router v6 with layouts
  - `PublicLayout` - Landing, login (OAuth redirect)
  - `AuthenticatedLayout` - Feed, clubs, events, messages, notifications
  - OAuth callback at `/auth/callback`
- **State Management**:
  - Zustand for client state
  - TanStack Query for server state/data fetching
- **Styling**: Tailwind CSS + Headless UI + Heroicons
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with `/api` proxied to `http://localhost:3000` in dev
- **Path Alias**: `@/` resolves to `src/`

### Database Schema (packages/database/)

Comprehensive Prisma schema including:

- **Users** - OAuth-based (Google/Facebook provider IDs)
- **Social** - Follow, Block relationships
- **Clubs** - With roles (OWNER, ADMIN, MODERATOR, MEMBER)
- **Posts** - Reactions, comments, likes, @mentions
- **Events** - Calendar events with RSVPs
- **Messages** - Direct messaging (Conversations, Messages)
- **Reviews** - Tobacco/cigar product reviews
- **Notifications** - In-app + push subscriptions (VAPID)
- **Moderation** - Content reports, user actions

**Binary Targets**: Configured for Railway deployment with `linux-musl-openssl-3.0.x`

### Prisma Workflow

1. Modify schema in `packages/database/prisma/schema.prisma`
2. Run `npm run prisma:migrate` (creates migration + updates client)
3. If only regenerating client: `npm run prisma:generate`
4. **Production**: Railway runs `prisma migrate deploy` automatically

## Deployment (Railway)

### Services

1. **PostgreSQL Database** - Managed Railway service
2. **API Service** - Express backend
   - Uses root `railway.toml`
   - Runs migrations on startup via `startCommand`
   - Builder: Railpack (Railway's modern builder)
3. **Web Service** - React frontend
   - Separate Nixpacks configuration

### Environment Variables

**API** (see `apps/api/.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Default 3000
- `NODE_ENV` - production
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` - Generate: `npx web-push generate-vapid-keys`
- `CORS_ORIGIN` - Frontend URL
- `MAX_FILE_SIZE` - Upload limit in bytes
- `UPLOAD_DIR` - File storage path

**Web** (see `apps/web/.env.example`):
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket URL (same as API)
- `VITE_VAPID_PUBLIC_KEY` - For push notifications

### Railway Configuration

The root `railway.toml` configures:
- `builder = "RAILPACK"` - Modern Railway builder
- `watchPatterns = ["**"]` - Deploy on any file change
- `startCommand` - Runs migrations then starts API

## Important Patterns & Notes

### TypeScript Project References

The monorepo uses TypeScript project references for proper module resolution:

- `apps/api/tsconfig.json` references `packages/database` and `packages/types`
- All referenced packages have `"composite": true` in their tsconfig
- Build command uses `tsc --build` to respect references

### ESM Module Imports

The API uses ES modules. In TypeScript files, imports must use `.js` extensions:

```typescript
// Correct
import { authenticate } from '../middleware/auth.js';

// Wrong
import { authenticate } from '../middleware/auth';
```

### Scheduled Jobs

Event reminder service runs on API startup (see `apps/api/src/services/eventReminderService.ts`).

### File Uploads

- Multer configured with size limits via `MAX_FILE_SIZE` env var
- Files stored in `UPLOAD_DIR` (Railway uses persistent volumes)

### No Traditional Authentication

This platform uses **OAuth only** (Google & Facebook). There is no email/password registration or login.

## Documentation

Comprehensive documentation in `/docs/`:

- `PROJECT_PLAN.md` - 10-week development roadmap
- `TECH_STACK.md` - Technology choices and rationale
- `RAILWAY_DEPLOYMENT.md` - Deployment guide
- `OAUTH_SETUP.md` - OAuth provider configuration
- `PERFORMANCE_OPTIMIZATION.md` - Performance guidelines
- `WIREFRAMES.md` - UI/UX mockups

## Current Status

**Completed**:
- Phase 1-5: Full platform features (auth, profiles, clubs, posts, events, DMs, notifications, reviews, moderation)
- Mobile responsiveness
- Performance optimization

**Pending**:
- Security audit
- Beta testing
- Production launch
