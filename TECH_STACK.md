# The Ember Society - Technical Stack

## Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js (lightweight, flexible)
- **Database**: PostgreSQL 15+ (Railway native support)
- **ORM**: Prisma (type-safe, excellent DX, migrations)
- **Authentication**: Passport.js (local + OAuth strategies)
- **Real-time**: Socket.io (WebSockets for DM and notifications)
- **File Storage**: Cloudinary or Railway Volumes (images/videos)
- **Job Queue**: BullMQ + Redis (for notifications, email jobs)

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast, modern)
- **Routing**: React Router v6
- **State Management**: Zustand (lightweight) + TanStack Query (server state)
- **UI Components**: Tailwind CSS + Headless UI
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io Client

## DevOps & Infrastructure
- **Hosting**: Railway
  - Backend API service
  - PostgreSQL database
  - Redis instance
  - Static frontend (or separate Vercel/Netlify)
- **CI/CD**: GitHub Actions → Railway auto-deploy
- **Environment**: Development, Staging, Production
- **Monitoring**: Railway metrics + Sentry (error tracking)

## Additional Services
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Email**: SendGrid or Resend
- **OAuth Providers**:
  - Google OAuth 2.0
  - Facebook Login
  - (Instagram future consideration)

## Why This Stack?
- **Railway Optimized**: PostgreSQL, Redis, and Node.js are first-class citizens
- **Monorepo Ready**: Can deploy backend/frontend separately or together
- **Type Safety**: TypeScript across full stack + Prisma
- **Scalable**: Socket.io supports horizontal scaling with Redis adapter
- **Cost Effective**: Railway's resource-based pricing works well with this stack
- **Developer Experience**: Hot reload, type checking, modern tooling

## Project Structure
```
/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # React frontend
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared config
├── railway.json      # Railway configuration
└── package.json      # Root workspace config
```
