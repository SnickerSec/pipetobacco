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

# Debug: Check workspace setup before building API
RUN echo "=== Pre-build diagnostics ===" && \
    echo "1. Node modules @ember-society:" && ls -la node_modules/@ember-society/ && \
    echo "2. Database package.json:" && cat node_modules/@ember-society/database/package.json && \
    echo "3. Database dist:" && ls -la node_modules/@ember-society/database/dist/ && \
    echo "4. Types dist:" && ls -la node_modules/@ember-society/types/dist/

# Build the API
RUN npm run build -w apps/api

# Verify the build worked - show what's actually in dist
RUN echo "=== Build verification ===" && \
    echo "1. Check dist directory exists:" && ls -la apps/api/ && \
    echo "2. Check dist contents:" && ls -la apps/api/dist/ && \
    echo "3. Check index.js exists:" && ls -la apps/api/dist/index.js && \
    echo "4. First 10 lines of index.js:" && head -10 apps/api/dist/index.js && \
    echo "5. Check node_modules symlinks:" && ls -la node_modules/@ember-society/ && \
    echo "6. Check database package dist:" && ls -la node_modules/@ember-society/database/dist/ || echo "Database dist not found"

# Set working directory to apps/api for npm workspace command to work
WORKDIR /app

# Run migrations then start
CMD ["sh", "-c", "echo '=== Runtime check ===' && \
    echo 'Working directory:' && pwd && \
    echo 'Apps/api contents:' && ls -la /app/apps/api/ && \
    echo 'Dist contents:' && ls -la /app/apps/api/dist/ && \
    echo 'Index.js path:' && ls -la /app/apps/api/dist/index.js && \
    echo 'Running migrations...' && \
    cd /app/packages/database && npx prisma migrate deploy && \
    echo 'Starting API...' && \
    cd /app && npm run start -w apps/api"]
