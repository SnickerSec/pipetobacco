# This file forces Railway to use Docker builder instead of Railpack
# Each service should override this with their specific Dockerfile in Railway settings

FROM node:20-alpine
WORKDIR /app
COPY . .
RUN echo "Please configure the service to use the correct Dockerfile (Dockerfile.api or Dockerfile.web)"
CMD ["echo", "Service not configured correctly"]
