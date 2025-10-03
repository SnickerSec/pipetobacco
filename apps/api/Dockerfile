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

# Run migrations then start
ENTRYPOINT ["sh", "-c"]
CMD ["cd packages/database && npx prisma migrate deploy && cd ../.. && npm run start -w apps/api"]
