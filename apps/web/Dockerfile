FROM node:20-alpine

WORKDIR /app

# Copy from monorepo root (context must be repo root, not apps/web)
COPY package*.json ./
COPY apps/web ./apps/web
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages

# Install all dependencies
RUN npm ci

# Accept build arg for Vite environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the web app
RUN npm run build -w apps/web

# Start the web server (no database needed)
CMD ["npm", "run", "start", "-w", "apps/web"]
