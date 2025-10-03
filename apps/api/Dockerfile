FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN npm ci

# Build the API
RUN npm run build -w apps/api

# Run migrations then start
CMD ["sh", "-c", "cd packages/database && npx prisma migrate deploy && cd ../.. && npm run start -w apps/api"]
