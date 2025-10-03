FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy monorepo files (Railway build context is still repo root even with Root Directory set)
COPY package*.json ./
COPY apps/api ./apps/api
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages

# Install all dependencies
RUN npm ci

# Build the API
RUN npm run build -w apps/api

# Verify the build worked
RUN ls -la apps/api/dist || (echo "ERROR: dist directory not created" && exit 1)

# Set working directory to apps/api for npm workspace command to work
WORKDIR /app

# Run migrations then start
CMD ["sh", "-c", "cd /app/apps/api && ls -la dist/ && cd /app && cd packages/database && npx prisma migrate deploy && cd ../.. && npm run start -w apps/api"]
