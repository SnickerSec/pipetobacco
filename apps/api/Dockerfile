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

# Start command will be provided by railway.toml
CMD ["npm", "run", "start", "-w", "apps/api"]
