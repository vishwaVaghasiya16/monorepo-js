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

## OOPs concepts
## https://docs.google.com/document/d/16BRV7pcyMylskIYHv89CrEk4PCgqbEaAHtiXEj2wXx0/edit?tab=t.0

## safe Note
## https://docs.google.com/document/d/17OWmKkVIwnL05zaTFCIMBJky8c35f8c34Ow4QPil8EU/edit?tab=t.0

## https://dbdiagram.io/d/692edc8cd6676488ba3fbd7c

Hello Ma’am, Good morning. My name is Vishwa Vaghasiya. 
I’m currently working as a Senior Backend Developer at LogicGo and I have almost 
2 years of hands-on experience in backend development.

During this time, I have worked on both client-based and product-based projects, 
and I enjoy solving complex backend problems.

My core skills include Node.js, Express.js, MongoDB, TypeScript, JavaScript and 
cloud-based deployment on DigitalOcean.

I am now exploring new opportunities where I can grow further, take on more 
challenging responsibilities, and work in an environment with stronger client exposure. 

That’s why I am here today.  
Thank you for giving me this opportunity and for reaching out to me on LinkedIn.




Great! હવે હું તારાં **exact role, tech stack, project, experience** પ્રમાણે **interview-ready full script** તૈયાર કરી દઉં છું— જેથી તું કોઈપણ client-based company માં confidently બોલી શકે.

---

# ⭐ **1. Perfect Self-Introduction (Tailored for Senior Node.js Developer)**

### **Version – Strong & Professional**

```
Hi, my name is ________. I’m currently working as a Senior Node.js Developer at LogicGo, 
and I will be completing almost 2 years in February 2026.

My core skill set includes Node.js, Express.js, TypeScript, JavaScript, MongoDB, and 
backend deployment on DigitalOcean cloud. I have been responsible for building scalable APIs, 
database design, creating reusable backend modules, and optimizing server performance.

Currently, I am working on a live client project called Viteezy. It is an e-commerce platform 
for pharmacy products based in the Netherlands with 90,000+ active users. I am involved in 
Viteezy V2 development which includes restructuring the backend architecture, improving 
performance, and integrating new features.

Now, I am looking for a client-based company where I can work closely with international clients, 
take more ownership, and contribute to backend system design at a deeper level.
Thank you.
```

---

# ⭐ **2. Reason for Leaving (Perfect Answer for Client-Based Companies)**

### **Version 1 – Career Growth (Safest & Strongest)**

```
I have completed almost 2 years at LogicGo and I have learned a lot there. 
But now the growth and exposure I’m looking for—especially direct client communication 
and working on large-scale international projects—is limited. 

I want to move into a company where backend architecture, scalability, and problem-solving 
are more challenging and client interaction is stronger.
```

### **Version 2 – “Looking for Better Opportunities in Backend Architecture”**

```
In my current company, I had good learning, but the project scope is now becoming repetitive.
I want to work on more scalable systems, microservices, performance optimization, 
and architecture-level decision making, which I can get in a client-based company.
```

### **Version 3 – Neutral (No negativity)**

```
There is no issue with my current company. 
I am just looking to upgrade my backend skills by working on more complex, 
client-driven projects.
```

---

# ⭐ **3. Project Explanation (Viteezy – E-commerce Pharmacy App)**

Interviewમાં પૂછે: *“Tell me about your current project?”* → આ જવાબ perfect છે.

```
I am currently working on a Netherlands-based e-commerce application called Viteezy. 
It is a pharmacy product marketplace with more than 90,000 active users.

In Viteezy V1, I mainly worked on backend API development, authentication, product 
management modules, and backend deployment on DigitalOcean.

Currently, I’m working on Viteezy V2 where we are improving backend architecture, 
optimizing slow APIs, restructuring database queries, and adding new modules to 
make the platform more scalable.

Tech stack we use:
– Node.js  
– Express.js  
– TypeScript  
– MongoDB  
– Server deployment on DigitalOcean  
– REST APIs  
– Middleware and modular architecture  

My role includes:
– Creating scalable backend APIs  
– Optimizing DB queries and reducing latency  
– Writing reusable modules  
– Implementing authentication & authorization  
– Integrating external services  
– Server monitoring & deployment  
– Working directly with the client team  
```

---

# ⭐ **4. If interviewer asks: “What is your contribution in Viteezy V2?”**

```
I contributed in rewriting legacy code into well-structured TypeScript modules, 
created new endpoints, optimized slow APIs, implemented better error handling and 
logging, and improved API performance. I also handled backend deployment, 
environment setup, and production-level debugging on DigitalOcean.
```

---

# ⭐ **5. Strengths (Backend Developer)**

```
– Strong logical thinking and problem solving  
– Clean coding and modular architecture  
– Ability to understand client requirements quickly  
– Experience with scalable APIs and DB optimization  
– Ownership mentality and fast learning  
```

---

# ⭐ **6. Weakness (Safe & Professional)**

```
Sometimes I take too much responsibility because I want everything to be perfect,
but I’m learning to balance quality with timelines.
```

---

# ⭐ **7. Why should we hire you? (Tailored to Client Companies)**

```
I have solid experience in Node.js and backend development along with working 
directly on international client projects. I can take end-to-end ownership—from 
understanding requirements to deployment.

I strongly focus on writing clean, scalable backend code and solving performance issues,
which is important for client-based companies. I learn things fast and I can contribute 
from day one.
```

---

# ⭐ Want to go further?

I can prepare:
✔ **Full mock interview (Live Q&A)**
✔ **More questions for Node.js/Express/MongoDB**
✔ **Behavioral round preparation**
✔ **HR round answers**
✔ **Resume content for your exact experience**
✔ **Company-specific preparation (client-based firms)**

---

👉 **Do you want a full mock interview right now?**
