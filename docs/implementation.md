# PortalRupee - Implementation Guide

## Tech Stack

### Backend
- **Framework**: Node.js (Express)
- **Database**: PostgreSQL
- **Cache**: Redis (for OTP, sessions)
- **Message Queue**: RabbitMQ / Apache Kafka (Post-MVP, for async processing)
- **File Storage**: AWS S3

### Frontend
- **Framework**: React
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Redux
- **Charts**: Chart.js (for statistics)

### Authentication & Security
- **JWT**: jsonwebtoken
- **OTP**: Twilio / AWS SNS (SMS), Nodemailer (Email)
- **Encryption**: bcrypt
- **Validation**: Joi / Zod

### DevOps & Deployment
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Post-MVP, for scaling)
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana (Post-MVP)

### Database Tools
- **ORM**: Prisma (Node.js)
- **Migration**: Database migration tools
- **Sharding**: Vitess (Post-MVP, only after initial version works)

### Testing
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **E2E Testing**: Cypress

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

### Phase 5: Scalability (Post-MVP)
**Note**: This phase will be implemented only after the initial version is working and tested.
- Database sharding implementation
- Read replica setup
- Load balancing
- Performance optimization

## Database Schema Overview

### Users Table
- id, role, email, mobile, password_hash
- profile_image_url, signature_image_url
- aadhar_no, dob, age, address
- guardian_name, guardian_relation
- created_at, updated_at

### Accounts Table
- id, user_id, account_number, account_type
- balance, status, created_at

### Transactions Table
- id, account_id, transaction_type
- amount, balance_before, balance_after
- tpin_verified, status, created_at

### OTP Table
- id, user_id, otp_code, purpose
- expires_at, verified, created_at

### Audit Logs Table
- id, user_id, action, details
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
- Single PostgreSQL database instance
- Single application server
- Basic Redis cache (single instance)
- Simple deployment setup
- Focus on core functionality and stability

### Post-MVP Scalability (Phase 5)

#### Sharding Strategy
- **Shard Key**: User ID (hash-based distribution)
- **Shard Count**: Initial 4 shards, scalable to N
- **Data Distribution**: Consistent hashing
- **Cross-shard Queries**: Query aggregator service
- **Implementation**: Only after initial version proves successful

#### Replication Setup
- **Master Database**: Write operations
- **Read Replicas**: 2-3 replicas for read operations
- **Replication Lag**: Monitor and alert on lag
- **Failover**: Automatic failover mechanism
- **Implementation**: Only after initial version proves successful

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

