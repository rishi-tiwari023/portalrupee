# PortalRupee - Implementation Guide

## Tech Stack (Final)

### Backend

| Layer             | Technology                                                   |
| ----------------- | ------------------------------------------------------------ |
| Runtime           | Node.js (ES Modules)                                         |
| Framework         | Express.js 4.x                                               |
| Database          | MongoDB Atlas (Mongoose 8.x ODM, replica set)                |
| Cache / OTP Store | Redis 5.x (OTP storage with TTL expiration)                  |
| Message Queue     | RabbitMQ (amqplib, 4 durable queues with in-process workers) |
| Real-time         | Socket.io 4.x (JWT cookie authentication)                   |
| Authentication    | JWT (jsonwebtoken), bcryptjs (12 rounds), Speakeasy (TOTP)   |
| Validation        | Zod 4.x (request body + query params)                        |
| File Storage      | AWS S3 (@aws-sdk/client-s3) with local filesystem fallback   |
| Email             | Nodemailer via Resend.io SMTP (with console mock for dev)    |
| PDF Generation    | Puppeteer + EJS templates                                    |
| Security          | Helmet, HPP, express-mongo-sanitize, express-rate-limit      |
| Performance       | Compression (gzip/brotli), MongoDB compound indexes          |
| Logging           | Morgan (dev mode)                                            |
| QR Codes          | qrcode (for 2FA authenticator app setup)                     |

### Frontend

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | React 19.x                                    |
| Build Tool       | Vite 7.x                                      |
| Styling          | Tailwind CSS 4.x (class-based dark mode)      |
| State Management | Redux Toolkit 2.x + React-Redux 9.x          |
| Routing          | React Router DOM 7.x (lazy-loaded routes)     |
| HTTP Client      | Axios (interceptors for auth, 401, 429, 5xx)  |
| Form Handling    | Formik 2.x + Zod 3.x (via zod-formik-adapter) |
| Charts           | Recharts 3.x (line, bar, pie charts)          |
| Real-time        | Socket.io Client 4.x                          |
| Animations       | Framer Motion 12.x, Anime.js 4.x             |
| Icons            | Lucide React, React Icons                     |
| Notifications    | React Toastify 11.x                           |

### Infrastructure

| Tool           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| Docker Compose | Orchestrate backend, Redis, and RabbitMQ containers |
| GitHub Actions | CI pipeline (lint) + CD pipeline (Docker + EC2)     |
| AWS EC2        | Backend hosting (t3.medium, Ubuntu 26.04)           |
| Vercel         | Frontend hosting (SPA with rewrite rules)           |
| Playwright     | End-to-end testing framework                        |

## Implementation Phases (Completed)

### Phase 1: Foundation and Authentication (Days 1-7)

- Express.js project setup with ES Modules and Mongoose ODM
- MongoDB Atlas connection with replica set for transaction support
- User schema with roles (Customer, Cashier, Manager), bcrypt password hashing
- Account schema (Savings/Current types, 12-digit account numbers)
- JWT authentication with access + refresh tokens in HTTP-only cookies
- `isAuth` and `checkRole` middleware for route protection
- Zod validation middleware for request bodies
- Redis integration for OTP storage with TTL
- Rate limiting: Global (100/15min) and Auth routes (10/15min)
- React 19 + Vite project with Tailwind CSS
- Redux Toolkit store with auth slice (login, register, logout, getMe)
- Axios instance with interceptors (withCredentials for cookies)
- React Router with public/protected route shells
- Login and Registration pages with Formik/Zod validation
- Navbar, Sidebar, Footer components
- RoleBasedRoute and GuestRoute guard components
- Error Boundary component

### Phase 2: Banking Core (Days 8-14)

- Account CRUD (create Savings/Current, list, get details)
- Balance inquiry with optional TOTP verification
- TPIN setup, change, and reset flows with bcrypt hashing
- Atomic Deposit/Withdraw using MongoDB sessions
- Mongoose transaction wrapper with write-conflict retry (5 attempts, exponential backoff)
- Transaction schema (Deposit/Withdraw/Transfer types, Pending/Success/Failed status)
- Peer-to-peer transfer with TPIN verification and atomic debit-credit
- User search API (by name, email, mobile, account number)
- Paginated transaction history with filters (type, status, date range, amount range, search)
- Audit log middleware tracking every mutation (actor, action, resource, IP, user-agent)
- Dashboard page with balance card, quick actions, account summary, recent transactions
- Deposit, Withdraw, and Transfer modals/pages
- TPINSetupWizard and TPINInput components
- TransactionTable with filters, pagination, and status badges
- TransactionDetailsModal for viewing full transaction information

### Phase 3: Security, OTP, and S3 Storage (Days 15-21)

- Nodemailer integration with Resend.io SMTP for production email
- OTP generation, Redis storage with TTL, send and verify endpoints
- OTP purposes: general, password_reset, tpin_reset, disable_2fa
- HTML email templates (Welcome, OTP variants with themed cards, Contact notification)
- AWS S3 integration with pre-signed URLs (15-minute expiry)
- Local filesystem fallback with HMAC-SHA256 signature verification
- File upload helper with UUID-based unique naming
- KYC document submission (ID proof + signature S3 keys)
- Password reset flow via OTP (Send OTP, Verify, Reset, Success steps)
- TPIN reset flow via OTP verification
- TOTP-based 2FA setup with QR code generation (Speakeasy)
- 2FA enable/disable with TOTP token verification
- TOTP secrets encrypted at rest with AES-256-CBC
- 2FA required for login, deposit, withdraw, transfer, and balance check when enabled
- Disable 2FA via email OTP for locked-out users
- Helmet.js, HPP, express-mongo-sanitize security middleware
- OTPInput component with 6-digit auto-focus and resend timer
- FileUpload component with drag-and-drop and progress bar
- TwoFactorSetup and TOTPVerifyModal components
- TPINRecoveryModal with OTP email verification flow
- Forgot Password modal with step-by-step progress indicator

### Phase 4: Messaging and Real-time Integration (Days 22-28)

- Socket.io server with JWT cookie authentication middleware
- SocketContext provider (auto-connect on auth, reconnection, connection status)
- Permission-based chat rooms (messaging only between users who have transacted)
- Deterministic room IDs: `chat_${sorted([userId1, userId2]).join('_')}`
- Message schema with sender, receiver, roomId, content, read receipts
- Chat message persistence via RabbitMQ queue (with inline fallback)
- Real-time typing indicators (typing/stop_typing events)
- Chat UI with message bubbles, timestamps, and scroll management
- Transaction notification emission via RabbitMQ queue
- Notification bell component with unread count badge
- Notification dropdown with mark as read, navigation to relevant pages
- Notifications persisted to localStorage
- MongoDB aggregation pipelines for expenditure analytics
- Spending trend charts (daily/monthly with zero-filled gaps)
- Auto-categorized expense breakdown (8 categories via regex matching)
- Inflow vs outflow comparison with net savings
- Recharts integration (line, bar, pie charts) with time range filtering
- PDF bank statement generation via EJS templates rendered with Puppeteer
- DownloadStatementModal with date range picker
- Manager system stats API (user counts, KYC distribution, balances, volumes)
- Manager user listing with search, filter by role/KYC, role changes, KYC approval

### Phase 5: Final Polish and Delivery (Days 29-35)

- RabbitMQ message queue implementation (4 durable queues: transaction alerts, chat messages, emails, audit logs)
- Graceful queue fallbacks (inline processing when RabbitMQ unavailable)
- Query indexing and response compression (gzip/brotli)
- Code splitting via lazy-loaded routes with Suspense
- Profile image upload to S3 with navbar avatar display
- Last login timestamp display on profile page
- Theme settings (light/dark/system) with localStorage persistence
- Customer deposit approval workflow (Pending status, Cashier/Manager approve/reject)
- Manager account freeze/unfreeze capability
- Freeze dispute submission and review system
- Cashier dashboard with deposit approval queue
- Manager dashboard with user management, freeze controls, dispute review
- Public pages: About, Contact Us, Terms, Guidelines, Interest Info
- Login/Register cleanup (simplified footer, removed unused social login options)
- Frozen account enforcement (auto-redirect + API blocking)
- Online/offline detection with toast notifications
- 2FA setup prompt for users without 2FA enabled
- Docker Compose orchestration (backend + Redis + RabbitMQ)
- GitHub Actions CI/CD (Docker build + EC2 deploy)
- Vercel frontend deployment with SPA rewrite rules
- Backend and frontend README documentation
- Postman collection for 50+ endpoints

## File Upload Flow (Implemented)

1. **Frontend**: User selects or drags a file into the FileUpload component
2. **Upload**: File is sent as multipart/form-data to `POST /api/v1/uploads` via Axios
3. **Backend**: Multer receives the file in memory storage, generates a UUID-based key
4. **Storage**: File is uploaded to AWS S3 (or saved to local `uploads/` directory if `USE_LOCAL_S3_FALLBACK=true`)
5. **Response**: Backend returns the S3 key (not the full URL)
6. **Association**: The S3 key is stored on the relevant model field (e.g., `profileImageKey`, `kycDocumentKey`, `kycSignatureKey`)
7. **Viewing**: Files are accessed via `GET /api/v1/uploads/view/:key` (HMAC-signed for local, pre-signed URL for S3, 15-minute expiry)

## Database Schema (Mongoose Models)

### User Model

| Field              | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| `firstName`        | String  | Required                                         |
| `lastName`         | String  | Required                                         |
| `email`            | String  | Required, unique, lowercase                      |
| `mobile`           | String  | Required, unique                                 |
| `password`         | String  | Hashed (bcrypt 12), select: false                |
| `tpin`             | String  | Hashed (bcrypt 12), select: false                |
| `tpinSet`          | Boolean | Whether TPIN has been configured                 |
| `role`             | Enum    | CUSTOMER (default), CASHIER, MANAGER             |
| `twoFactorEnabled` | Boolean | Whether TOTP 2FA is active                       |
| `twoFactorSecret`  | String  | AES-256 encrypted TOTP secret, select: false     |
| `kycStatus`        | Enum    | NOT_STARTED, PENDING, VERIFIED, REJECTED         |
| `kycDocumentKey`   | String  | S3 key for KYC ID document                       |
| `kycSignatureKey`  | String  | S3 key for KYC signature                         |
| `profileImageKey`  | String  | S3 key for profile image                         |
| `lastLogin`        | Date    | Last login timestamp                             |

Indexes: `{ kycStatus, updatedAt }`, `{ role, createdAt }`, `{ createdAt }`

### Account Model

| Field           | Type     | Description                                  |
| --------------- | -------- | -------------------------------------------- |
| `user`          | ObjectId | Reference to User                            |
| `accountNumber` | String   | 12-digit unique account number               |
| `accountType`   | Enum     | SAVINGS, CURRENT                             |
| `balance`       | Number   | Non-negative (min: 0)                        |
| `status`        | Enum     | ACTIVE, BLOCKED, CLOSED                      |
| `freezeDispute` | String   | Customer dispute message for frozen accounts |

Index: `{ user }`

### Transaction Model

| Field             | Type     | Description                                         |
| ----------------- | -------- | --------------------------------------------------- |
| `sender`          | ObjectId | User who initiated                                  |
| `receiver`        | ObjectId | Recipient user                                      |
| `senderAccount`   | ObjectId | Source account (required for Withdraw/Transfer)     |
| `receiverAccount` | ObjectId | Destination account (required for Deposit/Transfer) |
| `amount`          | Number   | Transaction amount (min: 1)                         |
| `type`            | Enum     | DEPOSIT, WITHDRAW, TRANSFER                         |
| `status`          | Enum     | PENDING, SUCCESS, FAILED                            |
| `description`     | String   | Optional transaction note                           |
| `transactionId`   | String   | Auto-generated unique ID (TXN-XXXXXXXX)             |
| `metadata`        | Map      | Extensible key-value metadata                       |

Indexes: `{ sender, createdAt }`, `{ receiver, createdAt }`, `{ senderAccount, createdAt }`, `{ receiverAccount, createdAt }`

### Message Model

| Field      | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `sender`   | ObjectId | Message sender                |
| `receiver` | ObjectId | Message recipient             |
| `roomId`   | String   | Deterministic room ID         |
| `content`  | String   | Message text                  |
| `read`     | Boolean  | Read receipt (default: false) |

Indexes: `{ roomId, createdAt }`, `{ sender }`, `{ receiver }`

### AuditLog Model

| Field        | Type     | Description                           |
| ------------ | -------- | ------------------------------------- |
| `actor`      | ObjectId | User who performed the action         |
| `action`     | String   | Action name (e.g., DEPOSIT)           |
| `resource`   | String   | Resource type (e.g., TRANSACTION)     |
| `resourceId` | String   | ID of the affected resource           |
| `details`    | Mixed    | Request method, URL, body (sanitized) |
| `ipAddress`  | String   | Client IP address                     |
| `userAgent`  | String   | Client user-agent                     |
| `status`     | Enum     | SUCCESS, FAILURE                      |

Indexes: `{ actor, createdAt }`, `{ resource, resourceId }`, `{ action }`

### Contact Model

| Field     | Type   | Description                |
| --------- | ------ | -------------------------- |
| `name`    | String | Submitter name (max: 100)  |
| `email`   | String | Submitter email            |
| `subject` | String | Message subject (max: 200) |
| `message` | String | Message body (max: 2000)   |
| `status`  | Enum   | NEW, READ, RESOLVED        |

Index: `{ status, createdAt }`

## API Endpoints (50+ Implemented)

| Route Group     | Base Path              | Endpoints | Key Operations                              |
| --------------- | ---------------------- | --------- | ------------------------------------------- |
| Authentication  | `/api/v1/auth`         | 8         | Register, Login, Logout, 2FA Verify, OTP, Reset |
| User Management | `/api/v1/users`        | 5         | Profile CRUD, Search, KYC Submit, Profile Image |
| TPIN            | `/api/v1/tpin`         | 3         | Set, Change, Reset (via OTP)                |
| Two-Factor Auth | `/api/v1/2fa`          | 3         | Setup QR, Enable, Disable                   |
| Accounts        | `/api/v1/accounts`     | 11        | CRUD, Balance, Freeze/Unfreeze, Disputes    |
| Transactions    | `/api/v1/transactions` | 7         | Deposit, Withdraw, Transfer, History, PDF, Approvals |
| Dashboard       | `/api/v1/dashboard`    | 2         | Summary, Analytics                          |
| Chat            | `/api/v1/chats`        | 3         | Rooms, Permissions, Message History         |
| File Uploads    | `/api/v1/uploads`      | 3         | Upload, View, Pre-signed URL                |
| Admin Panel     | `/api/v1/admin`        | 5         | Stats, Users, KYC Queue, Role Management    |
| Contact         | `/api/v1/contact`      | 1         | Public contact form submission              |
| Health          | `/health`              | 1         | Server health check                         |

## Rate Limiting (Implemented)

| Limiter        | Scope       | Limit            | Implementation        |
| -------------- | ----------- | ---------------- | --------------------- |
| Global Limiter | All routes  | 100 req / 15 min | express-rate-limit    |
| Auth Limiter   | Auth routes | 10 req / 15 min  | express-rate-limit    |

Both limiters are IP-based and return standardized error responses.

## Middleware Stack (Applied Order)

1. `helmet()` - Security HTTP headers
2. `cors()` - CORS with credentials for frontend origin
3. `compression()` - Gzip/Brotli response compression
4. `express.json({ limit: '10kb' })` - JSON body parser
5. `cookieParser()` - Parse JWT from HTTP-only cookies
6. `expressMongoSanitize()` - NoSQL injection prevention
7. `hpp()` - HTTP Parameter Pollution protection
8. `morgan('dev')` - Request logging (dev only)
9. `globalLimiter` - 100 requests per IP per 15 minutes
10. Route-specific: `isAuth`, `checkRole`, `verifyTPIN`, `validate(schema)`, `auditLogger`

## Deployment Architecture (Production)

```
[GitHub Push to main]
        |
        v
[GitHub Actions CI/CD]
   |             |
   v             v
[Docker Hub]  [EC2 SSH]
   |             |
   v             v
[Pull Image] [docker-compose up -d]
                 |
    +------------+------------+
    |            |            |
    v            v            v
[Backend]    [Redis]    [RabbitMQ]
 :5000        :6379    :5672 / :15672

[Vercel] <-- Frontend SPA
```

- **Backend**: AWS EC2 (t3.medium) running Docker Compose with three containers
- **Frontend**: Vercel with SPA rewrite rules (`vercel.json`)
- **Database**: MongoDB Atlas (replica set, required for transaction atomicity)
- **CI/CD**: GitHub Actions builds Docker image, pushes to Docker Hub, SSHs into EC2 and restarts

## Authors

- **Rishi Tiwari** and **Gagan Gupta**
