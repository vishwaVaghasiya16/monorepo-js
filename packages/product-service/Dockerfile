FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/common/package.json ./packages/common/

# Copy common package
COPY packages/common ./packages/common

# Copy product service package
COPY packages/product-service/package.json ./packages/product-service/
COPY packages/product-service ./packages/product-service

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3002

# Start service
WORKDIR /app/packages/product-service
CMD ["node", "server.js"]

