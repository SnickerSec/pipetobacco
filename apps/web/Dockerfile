FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN npm ci

# Build the web app
RUN npm run build -w apps/web

# Start the web server (no database needed)
CMD ["npm", "run", "start", "-w", "apps/web"]
