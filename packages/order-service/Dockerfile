FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/common/package.json ./packages/common/

# Copy common package
COPY packages/common ./packages/common

# Copy order service package
COPY packages/order-service/package.json ./packages/order-service/
COPY packages/order-service ./packages/order-service

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3003

# Start service
WORKDIR /app/packages/order-service
CMD ["node", "server.js"]

