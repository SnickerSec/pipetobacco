FROM node:20-alpine

WORKDIR /app

# Copy from monorepo root (Railway sets context to repo root)
COPY ../../package*.json ./
COPY ../../apps/web ./apps/web
COPY ../../apps/api/package.json ./apps/api/package.json
COPY ../../packages ./packages

# Install all dependencies
RUN npm ci

# Build the web app
RUN npm run build -w apps/web

# Start the web server (no database needed)
CMD ["npm", "run", "start", "-w", "apps/web"]
