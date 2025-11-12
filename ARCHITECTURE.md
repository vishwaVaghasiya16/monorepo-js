# Architecture Documentation

## System Architecture

This monorepo implements a microservices architecture pattern where each service is independently deployable and scalable.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      API Gateway (Future)             │
        └───────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌───────────────┐  ┌──────────────┐
│ Auth Service │   │Product Service│  │Order Service │
│  Port: 3001  │   │  Port: 3002   │  │  Port: 3003  │
└──────────────┘   └───────────────┘  └──────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  auth_db     │   │  product_db  │  │  order_db   │
│  (MongoDB)   │   │  (MongoDB)   │  │  (MongoDB)  │
└──────────────┘   └──────────────┘   └──────────────┘

        ┌───────────────────────────────────────┐
        │      @monorepo/common                  │
        │  (Shared Library - Logger, Middleware, │
        │   Constants, Types, Error Handler)     │
        └───────────────────────────────────────┘
```

## Service Responsibilities

### Auth Service

- **Purpose**: User authentication and authorization
- **Database**: `auth_db`
- **Key Features**:
  - User registration with password hashing
  - User login with JWT token generation
  - Token verification endpoint
  - User profile management

### Product Service

- **Purpose**: Product catalog management
- **Database**: `product_db`
- **Key Features**:
  - CRUD operations for products
  - Product availability checking
  - Stock management
  - Product status management

### Order Service

- **Purpose**: Order processing and management
- **Database**: `order_db`
- **Key Features**:
  - Order creation with product validation
  - Order status management
  - Order cancellation with stock restoration
  - Inter-service communication with Auth and Product services

## Inter-Service Communication

### Communication Patterns

1. **Synchronous HTTP Communication**

   - Order Service → Auth Service: Token verification
   - Order Service → Product Service: Product details, availability checks, stock updates

2. **Shared Authentication**
   - All services use the same JWT secret from common package
   - Auth middleware validates tokens across services

### Service Client Pattern

The Order Service uses a `ServiceClient` class to handle inter-service communication:

```javascript
// Example: Checking product availability
const availability = await serviceClient.checkProductAvailability(
  productId,
  quantity
);
```

## Data Flow

### Order Creation Flow

1. Client sends order request to Order Service with JWT token
2. Order Service validates token using Auth Service
3. Order Service checks product availability with Product Service
4. Order Service fetches product details from Product Service
5. Order Service creates order in its database
6. Order Service updates product stock in Product Service
7. Order Service returns order confirmation to client

### Order Cancellation Flow

1. Client sends cancellation request to Order Service
2. Order Service validates request and updates order status
3. Order Service restores product stock in Product Service
4. Order Service returns cancellation confirmation

## Database Strategy

### Database Per Service Pattern

Each microservice has its own MongoDB database:

- **auth_db**: User data
- **product_db**: Product catalog
- **order_db**: Order data

This ensures:

- Service independence
- Data isolation
- Independent scaling
- Technology flexibility

## Shared Library Architecture

The `@monorepo/common` package provides:

### Logger

- Winston-based structured logging
- Configurable log levels
- Colorized console output
- Stack trace support

### Middleware

- **Error Handler**: Centralized error handling with proper HTTP status codes
- **Auth Middleware**: JWT token verification for protected routes

### Constants

- HTTP status codes
- Service ports and URLs
- MongoDB configuration
- JWT configuration

### Types

- Enums for UserRole, OrderStatus, ProductStatus
- Type definitions for shared data structures

## Security Architecture

### Authentication Flow

1. User registers/logs in via Auth Service
2. Auth Service returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Services validate token using shared JWT secret
5. Token payload contains user ID, email, and role

### Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with expiration
- Token verification on protected routes
- Input validation
- Error message sanitization

## Scalability Considerations

### Horizontal Scaling

Each service can be scaled independently:

- Run multiple instances of each service
- Use load balancer for service distribution
- Database connections are per-service

### Future Enhancements

1. **API Gateway**: Central entry point for all services
2. **Service Discovery**: Dynamic service location
3. **Message Queue**: Async communication (RabbitMQ, Kafka)
4. **Caching**: Redis for frequently accessed data
5. **Monitoring**: Distributed tracing (Jaeger, Zipkin)
6. **Circuit Breaker**: Fault tolerance for inter-service calls

## Deployment Architecture

### Docker Compose Setup

- All services containerized
- Shared Docker network for inter-service communication
- MongoDB as separate container
- Environment variables for configuration

### Production Considerations

1. **Environment Variables**: Use secrets management
2. **Health Checks**: Implement comprehensive health endpoints
3. **Logging**: Centralized logging (ELK stack)
4. **Monitoring**: APM tools (New Relic, Datadog)
5. **Database**: Use managed MongoDB (Atlas) or dedicated instances
6. **Load Balancing**: Nginx or cloud load balancers

## Error Handling Strategy

### Error Propagation

1. Service-level errors caught by error handler
2. Errors logged with context
3. Appropriate HTTP status codes returned
4. Error messages sanitized for production

### Inter-Service Error Handling

- Service client handles HTTP errors
- Graceful degradation when services unavailable
- Retry logic for transient failures (future enhancement)

## Testing Strategy

### Unit Testing

- Test individual service components
- Mock inter-service calls
- Test business logic in isolation

### Integration Testing

- Test service interactions
- Test database operations
- Test authentication flows

### End-to-End Testing

- Test complete user flows
- Test cross-service operations
- Test error scenarios

## Development Workflow

1. **Local Development**: Run services individually or via `npm run dev`
2. **Docker Development**: Use `docker-compose up` for containerized environment
3. **Shared Code**: Changes to common package affect all services
4. **Service Independence**: Services can be developed and tested independently
