# Node.js Monorepo - Microservices Architecture

A production-ready Node.js monorepo demonstrating microservices architecture with MongoDB, featuring three independent services that communicate with each other.

## 🏗️ Architecture Overview

This monorepo contains three microservices:

1. **Auth Service** (Port 3001) - User authentication and authorization
2. **Product Service** (Port 3002) - Product catalog management
3. **Order Service** (Port 3003) - Order processing with inter-service communication

All services share a common library (`@monorepo/common`) containing shared utilities, middleware, constants, and types.

## 📁 Project Structure

```
monorepo-js/
├── packages/
│   ├── common/              # Shared library
│   │   ├── src/
│   │   │   ├── logger.js
│   │   │   ├── constants.js
│   │   │   ├── types.js
│   │   │   └── middleware/
│   │   │       ├── errorHandler.js
│   │   │       └── auth.js
│   │   └── package.json
│   ├── auth-service/        # Authentication microservice
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── product-service/     # Product catalog microservice
│   │   ├── models/
│   │   │   └── Product.js
│   │   ├── routes/
│   │   │   └── products.js
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   └── package.json
│   └── order-service/       # Order processing microservice
│       ├── models/
│       │   └── Order.js
│       ├── routes/
│       │   └── orders.js
│       ├── services/
│       │   └── serviceClient.js
│       ├── server.js
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (or use Docker Compose)
- npm or yarn

### Local Development Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Start MongoDB:**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0

   # Or use your local MongoDB instance
   ```

3. **Set environment variables (optional):**
   Create `.env` files in each service directory or use defaults:

   ```env
   MONGODB_URI=mongodb://localhost:27017
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Run all services in development mode:**

   ```bash
   npm run dev
   ```

   Or run services individually:

   ```bash
   npm run dev --workspace=@monorepo/auth-service
   npm run dev --workspace=@monorepo/product-service
   npm run dev --workspace=@monorepo/order-service
   ```

   **Note**: Use the package name (e.g., `@monorepo/auth-service`) when referencing workspaces, not the directory name.

### Docker Setup

1. **Build and start all services:**

   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**

   ```bash
   docker-compose up -d
   ```

3. **View logs:**

   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📡 API Endpoints

### Auth Service (Port 3001)

- `POST /api/auth/register` - Register a new user

  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user

  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires Bearer token)

### Product Service (Port 3002)

- `GET /api/products` - Get all products (supports query: `?status=active&category=electronics&page=1&limit=10`)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (requires authentication in production)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/availability?quantity=5` - Check product availability

### Order Service (Port 3003)

All endpoints require authentication (Bearer token).

- `GET /api/orders` - Get user's orders (supports query: `?status=pending&page=1&limit=10`)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
  ```json
  {
    "items": [
      {
        "productId": "product_id_here",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }
  ```
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

## 🔄 Inter-Service Communication

The Order Service communicates with other services:

1. **Auth Service**: Verifies JWT tokens using the auth middleware from the common package
2. **Product Service**:
   - Fetches product details
   - Checks product availability
   - Updates product stock when orders are created/cancelled

Communication is handled via HTTP requests using Axios in the `serviceClient.js` utility.

## 🛠️ Shared Library (`@monorepo/common`)

The common package provides:

- **Logger**: Winston-based logging with colorized console output
- **Error Handler**: Centralized error handling middleware
- **Auth Middleware**: JWT token verification
- **Constants**: HTTP status codes, service ports, URLs, MongoDB URI, JWT config
- **Types**: Enums for UserRole, OrderStatus, ProductStatus

## 🗄️ Database Schema

### Auth Service Database (`auth_db`)

- **Users**: username, email, password (hashed), role, timestamps

### Product Service Database (`product_db`)

- **Products**: name, description, price, stock, status, category, timestamps

### Order Service Database (`order_db`)

- **Orders**: userId, items[], totalAmount, status, shippingAddress, timestamps

## 🔐 Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Token verification middleware
- Input validation
- Error handling

## 📝 Environment Variables

| Variable         | Description               | Default                                |
| ---------------- | ------------------------- | -------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string | `mongodb://localhost:27017`            |
| `JWT_SECRET`     | Secret key for JWT tokens | `your-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | JWT token expiration      | `24h`                                  |
| `LOG_LEVEL`      | Logging level             | `info`                                 |
| `NODE_ENV`       | Environment mode          | `development`                          |

## 🧪 Testing the Services

### 1. Register a user:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response.

### 3. Create a product:

```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 10,
    "category": "electronics"
  }'
```

### 4. Create an order:

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## 🐳 Docker Services

- **mongodb**: MongoDB 7.0 database
- **auth-service**: Authentication service
- **product-service**: Product catalog service
- **order-service**: Order processing service

All services are connected via a Docker network for inter-service communication.

## 📚 Key Concepts Demonstrated

1. **Monorepo Structure**: Using npm workspaces for managing multiple packages
2. **Microservices Architecture**: Independent, scalable services
3. **Shared Libraries**: Code reuse across services
4. **Inter-Service Communication**: HTTP-based service-to-service calls
5. **Database Per Service**: Each service has its own MongoDB database
6. **Containerization**: Docker and Docker Compose for deployment
7. **Error Handling**: Centralized error handling middleware
8. **Logging**: Structured logging across services
9. **Authentication**: JWT-based auth with shared middleware

## 🔧 Development Tips

- Use `npm run dev` to start all services with hot-reload
- Each service runs on its own port and database
- Services can be developed and deployed independently
- The common package is automatically linked via npm workspaces

## 📄 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to use it as a starting point for your own microservices architecture.
