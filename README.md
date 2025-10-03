# Herf Social

A social networking platform for cigar and pipe tobacco enthusiasts.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Real-time**: Socket.io
- **Hosting**: Railway

## Project Structure

```
├── apps/
│   ├── api/          # Express backend API
│   └── web/          # React frontend
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configuration
└── railway.json      # Railway deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Generate Prisma client
cd packages/database
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Development

```bash
# Run all services in development mode
npm run dev

# Or run individually:
cd apps/api && npm run dev    # Backend on :3000
cd apps/web && npm run dev    # Frontend on :5173
```

### Database Management

```bash
cd packages/database

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Push schema changes (development only)
npm run prisma:push
```

## Deployment to Railway

### Backend API

1. Create a new Railway project
2. Add PostgreSQL database service
3. Add Redis service (for Socket.io and jobs)
4. Add API service:
   - Root directory: `apps/api`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Set environment variables from `apps/api/.env.example`

### Frontend

Option 1: Deploy to Railway
- Root directory: `apps/web`
- Build command: `npm install && npm run build`
- Start command: `npm run preview`

Option 2: Deploy to Vercel/Netlify (recommended for static sites)
- Connect to Git repository
- Set build directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`

## Documentation

For detailed documentation, see the [docs](./docs) directory:

- [Project Plan & Roadmap](./docs/PROJECT_PLAN.md)
- [Tech Stack Details](./docs/TECH_STACK.md)
- [Railway Deployment Guide](./docs/RAILWAY_DEPLOYMENT.md)
- [OAuth Setup](./docs/OAUTH_SETUP.md)
- [Complete Documentation Index](./docs/README.md)

## Current Status

✅ Phase 1 - Task 1.1: Technical Stack Finalized
✅ Phase 1 - Task 1.5: Core Hosting & Project Structure Setup
⏳ Phase 1 - Task 1.2: Data Schema Design (Next)

## License

Private - All Rights Reserved
