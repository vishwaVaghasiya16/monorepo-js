# Setup Guide

This guide will help you set up and run the microservices monorepo on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)

  ```bash
  node --version
  ```

- **npm** (comes with Node.js)

  ```bash
  npm --version
  ```

- **MongoDB** (version 5.0 or higher)

  - Option 1: Install MongoDB locally
  - Option 2: Use Docker (recommended)
  - Option 3: Use MongoDB Atlas (cloud)

- **Docker and Docker Compose** (optional, for containerized setup)
  ```bash
  docker --version
  docker-compose --version
  ```

## Installation Steps

### Step 1: Clone or Navigate to Project

```bash
cd /path/to/monorepo-js
```

### Step 2: Install Dependencies

**Important**: Always run `npm install` at the root directory first. This sets up the workspace links and installs all dependencies.

```bash
npm install
```

This will:

- Set up npm workspace links
- Install dependencies for the root package (concurrently for running multiple services)
- Install dependencies for all workspace packages:
  - Common package (shared utilities)
  - Auth service
  - Product service
  - Order service

**Note**: After running `npm install` at the root, you can reference workspaces using their package names (e.g., `@monorepo/auth-service`) in workspace commands.

### Step 3: Set Up MongoDB

#### Option A: Using Docker (Recommended)

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

#### Option B: Local MongoDB Installation

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

#### Option C: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update `MONGODB_URI` in environment variables

### Step 4: Configure Environment Variables (Optional)

Create `.env` files in each service directory if you want to override defaults:

**packages/auth-service/.env**

```env
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
LOG_LEVEL=info
```

**packages/product-service/.env**

```env
MONGODB_URI=mongodb://localhost:27017
NODE_ENV=development
LOG_LEVEL=info
```

**packages/order-service/.env**

```env
MONGODB_URI=mongodb://localhost:27017
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
NODE_ENV=development
LOG_LEVEL=info
```

**Note**: If you don't create `.env` files, the services will use default values from the common package.

### Step 5: Start Services

#### Option A: Run All Services Together (Development)

```bash
npm run dev
```

This starts all three services simultaneously with hot-reload enabled.

#### Option B: Run Services Individually

Open separate terminal windows:

**Terminal 1 - Auth Service:**

```bash
npm run dev --workspace=@monorepo/auth-service
```

**Terminal 2 - Product Service:**

```bash
npm run dev --workspace=@monorepo/product-service
```

**Terminal 3 - Order Service:**

```bash
npm run dev --workspace=@monorepo/order-service
```

### Step 6: Verify Services are Running

Check health endpoints:

```bash
# Auth Service
curl http://localhost:3001/health

# Product Service
curl http://localhost:3002/health

# Order Service
curl http://localhost:3003/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "auth-service"
}
```

## Docker Setup (Alternative)

If you prefer to run everything in Docker:

### Step 1: Build and Start All Services

```bash
docker-compose up --build
```

### Step 2: Run in Background

```bash
docker-compose up -d
```

### Step 3: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

### Step 4: Stop Services

```bash
docker-compose down
```

### Step 5: Stop and Remove Volumes

```bash
docker-compose down -v
```

## Testing the Setup

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

### 2. Create a Product

```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "Apple MacBook Pro 16-inch",
    "price": 2499.99,
    "stock": 10,
    "category": "electronics"
  }'
```

Save the `_id` from the response.

### 3. Create an Order

Replace `YOUR_TOKEN` and `PRODUCT_ID` with actual values:

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "USA"
    }
  }'
```

## Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:

- Stop the service using the port
- Change the port in `packages/common/src/constants.js`
- Kill the process: `lsof -ti:3001 | xargs kill`

### Issue: MongoDB Connection Failed

**Error**: `MongoServerError: connection timed out`

**Solutions**:

1. Verify MongoDB is running:

   ```bash
   # Docker
   docker ps | grep mongodb

   # Local
   mongosh --eval "db.version()"
   ```

2. Check MongoDB URI in environment variables
3. Verify network connectivity
4. Check MongoDB logs

### Issue: Module Not Found

**Error**: `Cannot find module '@monorepo/common'`

**Solution**:

```bash
# Reinstall dependencies
rm -rf node_modules packages/*/node_modules
npm install
```

### Issue: JWT Token Invalid

**Error**: `Invalid or expired token`

**Solutions**:

1. Ensure you're using the correct token from login/register
2. Check JWT_SECRET matches across services
3. Verify token hasn't expired
4. Ensure Authorization header format: `Bearer <token>`

### Issue: Service Communication Failed

**Error**: `Failed to fetch product` or `Token verification failed`

**Solutions**:

1. Verify all services are running
2. Check service URLs in environment variables
3. Verify network connectivity between services
4. Check service logs for detailed errors

## Development Tips

### Hot Reload

Services use `node --watch` for automatic reloading on file changes. No need to restart manually.

### Logging

All services use structured logging. Log levels can be controlled via `LOG_LEVEL` environment variable:

- `error`: Only errors
- `warn`: Warnings and errors
- `info`: Info, warnings, and errors (default)
- `debug`: All logs

### Database Management

Each service uses a separate database:

- `auth_db`: User data
- `product_db`: Product data
- `order_db`: Order data

You can connect to MongoDB and inspect databases:

```bash
mongosh mongodb://localhost:27017
use auth_db
db.users.find()
```

### Workspace Commands

Run commands in specific workspaces using the package name:

```bash
# Install dependency in specific service
npm install express --workspace=@monorepo/auth-service

# Run script in specific service
npm run dev --workspace=@monorepo/product-service

# Build specific service
npm run build --workspace=@monorepo/order-service
```

**Troubleshooting**: If you get "No workspaces found" error:

1. Make sure you've run `npm install` at the root directory first
2. Use the package name (e.g., `@monorepo/auth-service`) not the directory name
3. Verify the workspace is listed in `package.json` workspaces array

## Next Steps

1. Explore the API endpoints (see README.md)
2. Review the architecture documentation (ARCHITECTURE.md)
3. Customize services for your needs
4. Add tests
5. Set up CI/CD pipeline
6. Deploy to production

## Production Deployment

For production deployment:

1. Set strong `JWT_SECRET`
2. Use environment-specific MongoDB URIs
3. Enable HTTPS
4. Set up monitoring and logging
5. Configure rate limiting
6. Set up API gateway
7. Use managed database services
8. Implement proper error tracking

## Support

For issues or questions:

1. Check the README.md for API documentation
2. Review ARCHITECTURE.md for system design
3. Check service logs for errors
4. Verify all prerequisites are installed
