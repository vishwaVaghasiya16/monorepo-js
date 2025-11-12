# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be >= 18.0.0
npm --version
docker --version  # Optional
```

## Quick Setup

### 1. Install Dependencies

**Important**: Always run `npm install` at the root directory first to set up workspace links.

```bash
npm install
```

This installs dependencies for all packages and sets up the workspace structure. After this, you can use workspace commands.

### 2. Start MongoDB (Choose One)

**Option A: Docker (Easiest)**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Option B: Local MongoDB**

```bash
# Make sure MongoDB is running locally
mongosh --eval "db.version()"
```

### 3. Start All Services

```bash
npm run dev
```

You should see:

```
Auth Service running on port 3001
Product Service running on port 3002
Order Service running on port 3003
```

### 4. Test the Services

**Register a user:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login (save the token):**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Create a product (save the \_id):**

```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High-performance laptop","price":999.99,"stock":10,"category":"electronics"}'
```

**Create an order (replace TOKEN and PRODUCT_ID):**

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"productId":"PRODUCT_ID","quantity":1}],"shippingAddress":{"street":"123 Main St","city":"NYC","state":"NY","zipCode":"10001","country":"USA"}}'
```

## Docker Quick Start

```bash
# Start everything
docker-compose up --build

# In another terminal, test
curl http://localhost:3001/health
```

## Service URLs

- Auth Service: http://localhost:3001
- Product Service: http://localhost:3002
- Order Service: http://localhost:3003

## Health Checks

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

## Common Commands

```bash
# Run all services
npm run dev

# Run specific service (use package name)
npm run dev --workspace=@monorepo/auth-service
npm run dev --workspace=@monorepo/product-service
npm run dev --workspace=@monorepo/order-service

# Install dependency in specific workspace
npm install <package> --workspace=@monorepo/auth-service

# Docker
docker-compose up -d          # Start in background
docker-compose logs -f         # View logs
docker-compose down            # Stop services
```

## Troubleshooting

**Port in use?**

```bash
lsof -ti:3001 | xargs kill
```

**MongoDB not connecting?**

```bash
docker ps | grep mongodb  # Check if running
```

**Module not found?**

```bash
# Clean and reinstall
rm -rf node_modules packages/*/node_modules
npm install
```

**Workspace not found error?**

If you see `npm ERR! No workspaces found`, make sure you:

1. Run `npm install` at the root directory first
2. Use the package name (e.g., `@monorepo/auth-service`) instead of directory name
3. Check that the workspace is properly configured in root `package.json`

## Next Steps

- Read [README.md](./README.md) for full API documentation
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [SETUP.md](./SETUP.md) for detailed setup instructions

## Project Structure

```
monorepo-js/
├── packages/
│   ├── common/          # Shared utilities
│   ├── auth-service/    # Port 3001
│   ├── product-service/ # Port 3002
│   └── order-service/   # Port 3003
├── docker-compose.yml
└── package.json
```

Happy coding! 🚀
