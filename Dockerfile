# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Build packages in order
RUN npm run prisma:generate -w packages/database
RUN npm run build -w packages/database
RUN npm run build -w packages/types
RUN npm run build -w apps/api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose port
EXPOSE 3000

# Start command (run migrations then start)
CMD cd apps/api && npx prisma migrate deploy --schema ../../packages/database/prisma/schema.prisma && cd ../.. && npm run start -w apps/api
