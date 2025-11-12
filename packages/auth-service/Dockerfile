FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/common/package.json ./packages/common/

# Copy common package
COPY packages/common ./packages/common

# Copy auth service package
COPY packages/auth-service/package.json ./packages/auth-service/
COPY packages/auth-service ./packages/auth-service

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3001

# Start service
WORKDIR /app/packages/auth-service
CMD ["node", "server.js"]

