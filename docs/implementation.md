# PortalRupee - Implementation Guide

## Tech Stack

### Backend
- **Framework**: Node.js (Express)
- **Database**: MongoDB
- **ODM**: Mongoose
- **Cache**: Redis (for OTP, sessions)
- **Real-time**: Socket.io (for chat and notifications)
- **Message Queue**: RabbitMQ / Apache Kafka (Post-MVP, for async processing)
- **File Storage**: AWS S3

### Frontend
- **Framework**: React
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Redux, Socket.io-client
- **Charts**: Chart.js (for statistics)

### Authentication & Security
- **JWT**: jsonwebtoken
- **OTP**: Nodemailer (Gmail SMTP for Dev, Resend for Production)
- **Encryption**: bcrypt
- **Validation**: Zod

### DevOps & Deployment
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Post-MVP, for scaling)
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana (Post-MVP)

### Database Tools
- **ODM**: Mongoose
- **Migration**: MongoDB aggregation and script-based migrations
- **Sharding**: MongoDB's native sharding (Post-MVP)

### Testing
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **E2E Testing**: Cypress / Playwright (Post-MVP)

## Implementation Phases

### Phase 1: Core Setup
- Project structure
- Database schema design
- Authentication system
- User management (CRUD)
- Basic role-based access

### Phase 2: Account & Transaction
- Account creation (Savings/Current)
- Basic transactions
- Transaction history
- PIN/TPIN management

### Phase 3: Security & OTP
- OTP integration (SMS/Email)
- OTP verification on registration
- Reset PIN with OTP
- Enhanced security measures

### Phase 4: Analytics & Reporting
- Expenditure summary
- Statistical dashboards
- Reporting features
- Data visualization

### Phase 5: Messaging & Real-time Integration
- Chat system implementation (Socket.io)
- Payment-based messaging permissions
- Notification system
- Real-time balance updates

### Phase 6: Scalability (Post-MVP)
**Note**: This phase will be implemented only after the initial version is working and tested.
- MongoDB Sharding implementation
- Replica Set setup
- Load balancing
- Performance optimization

## File Upload Flow
- **Frontend**: User selects file and sends it to the Backend.
- **Backend (Node.js)**: Receives file, performs validation (Zod), and uploads to **AWS S3**.
- **S3**: Successfully stores the file and returns a public URL.
- **MongoDB**: The Backend stores the S3 URL in the relevant user/transaction document.

## Database Schema Overview (MongoDB Collections)

### Users Collection
- _id, role, email, mobile, password_hash
- profile_image_url, signature_image_url
- aadhar_no, dob, age, address
- guardian_details: { name, relation }
- chat_permissions: [user_ids] (Users allowed to message)
- timestamps: { created_at, updated_at }

### Accounts Collection
- _id, user_id, account_number, account_type
- balance, status, created_at

### Transactions Collection
- _id, account_id, sender_id, receiver_id, transaction_type
- amount, balance_before, balance_after
- tpin_verified, status, created_at

### Messages Collection
- _id, sender_id, receiver_id, content
- status (read/unread), created_at

### OTP Collection
- _id, user_id, otp_code, purpose
- expires_at, verified, created_at

### Audit Logs Collection
- _id, user_id, action, details
- ip_address, timestamp

## API Architecture

### RESTful Endpoints Structure
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User management
- `/api/v1/accounts/*` - Account operations
- `/api/v1/transactions/*` - Transaction operations
- `/api/v1/analytics/*` - Analytics and reporting
- `/api/v1/admin/*` - Admin operations

### API Versioning
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Header-based versioning support

### Rate Limiting
- Per-user rate limits
- Per-IP rate limits
- Different limits for different endpoints
- Redis-based rate limiting

### Input Validation
- Request body validation
- Query parameter validation
- Path parameter validation
- Schema validation using Joi/Zod

## Scalability Implementation

**Important**: Load balancing, sharding, and replication will be implemented only after the initial version is working, tested, and stable. The initial version will use a single database instance and basic deployment setup.

### Initial Version (MVP)
- Single MongoDB instance
- Single application server with Socket.io
- Basic Redis cache (single instance)
- Simple deployment setup via GitHub Actions
- Focus on core functionality, stability, and secure transactions

### Post-MVP Scalability (Phase 6)

#### Sharding Strategy
- **Shard Key**: `user_id` or `hashed` key for even distribution
- **Implementation**: MongoDB native sharding
- **Implementation Note**: Only after initial version proves successful

#### Replication Setup
- **Replica Sets**: 3-node replica set for high availability
- **Primary**: Write operations
- **Secondaries**: Read operations and failover
- **Implementation Note**: Only after initial version proves successful

#### Load Balancing
- Application layer load balancing
- Database connection pooling
- Redis cluster for cache
- CDN for static assets
- **Implementation**: Only after initial version proves successful

#### Performance Optimization
- Database indexing strategy
- Query optimization
- Caching strategy (Redis)
- Connection pooling
- Async processing for heavy operations

