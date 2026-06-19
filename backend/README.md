# PortalRupee - Backend

> RESTful API server powering PortalRupee, a full-featured digital banking platform with real-time messaging, role-based access, and event-driven architecture.

![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-5.x-DC382D?logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.x-FF6600?logo=rabbitmq&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socketdotio&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Seeding](#database-seeding)
  - [Running the Server](#running-the-server)
  - [Postman Collection](#postman-collection)
- [API Reference](#api-reference)
  - [Authentication](#1-authentication)
  - [User Management](#2-user-management)
  - [TPIN Management](#3-tpin-management)
  - [Two-Factor Authentication (2FA)](#4-two-factor-authentication-2fa)
  - [Account Management](#5-account-management)
  - [Transactions](#6-transactions)
  - [Dashboard & Analytics](#7-dashboard--analytics)
  - [Chat & Messaging](#8-chat--messaging)
  - [File Uploads (S3 / Local)](#9-file-uploads-s3--local)
  - [Admin / Manager Panel](#10-admin--manager-panel)
  - [Contact Form](#11-contact-form)
  - [Health Check](#12-health-check)
- [Data Models](#data-models)
- [Middleware](#middleware)
- [Real-time Events (Socket.io)](#real-time-events-socketio)
- [Message Queue (RabbitMQ)](#message-queue-rabbitmq)
- [Email System](#email-system)
- [Security](#security)
- [Seeded Test Accounts](#seeded-test-accounts)
- [Scripts](#scripts)

---

## Overview

PortalRupee Backend is an Express.js REST API built with ES Modules and Mongoose ODM. It implements a complete digital banking workflow including:

- **Multi-role authentication** (Customer, Cashier, Manager) with JWT + HTTP-only cookies
- **Atomic financial transactions** (Deposit, Withdraw, Transfer) using MongoDB sessions with write-conflict retry logic
- **TPIN-secured transfers** with bcrypt-hashed 6-digit transaction PINs
- **TOTP-based Two-Factor Authentication** via Speakeasy + QR code generation
- **OTP email verification** with Redis TTL storage and Resend.io SMTP
- **KYC document management** with AWS S3 (or local filesystem fallback) and pre-signed URLs
- **Real-time communication** via Socket.io with permission-based chat rooms (only users who have transacted can message each other)
- **Event-driven processing** via RabbitMQ message queues (transaction alerts, chat persistence, email dispatch, audit logs) with graceful fallbacks
- **Expenditure analytics** powered by MongoDB aggregation pipelines (spending trends, category breakdown, inflow vs outflow)
- **PDF bank statement generation** using EJS templates rendered with Puppeteer
- **Cashier approval workflow** for customer-initiated deposits
- **Manager capabilities** including account freeze/unfreeze, KYC approval, user role management, and system-wide statistics
- **Comprehensive audit logging** tracking every mutation with actor, action, resource, IP, and user-agent

---

## Tech Stack

| Layer             | Technology                                                    |
| ----------------- | ------------------------------------------------------------- |
| Runtime           | Node.js (ES Modules)                                          |
| Framework         | Express.js 4.x                                                |
| Database          | MongoDB Atlas (Mongoose 8.x ODM)                              |
| Cache / OTP Store | Redis 5.x                                                     |
| Message Queue     | RabbitMQ (amqplib)                                            |
| Real-time         | Socket.io 4.x                                                 |
| Authentication    | JWT (jsonwebtoken), bcryptjs, Speakeasy (TOTP)                |
| Validation        | Zod 4.x                                                       |
| File Storage      | AWS S3 (@aws-sdk/client-s3) with local filesystem fallback    |
| Email             | Nodemailer via Resend.io SMTP (with mock fallback for dev)    |
| PDF Generation    | Puppeteer + EJS templates                                     |
| Security          | Helmet, HPP, express-mongo-sanitize, express-rate-limit, CORS |
| Performance       | Compression, MongoDB compound indexes                         |
| Logging           | Morgan (dev mode)                                             |
| QR Codes          | qrcode (for 2FA setup)                                        |

---

## Architecture

```
+----------------+      +----------------+      +--------------------+
|    Frontend    |<---->|   Express.js   |<---->|   MongoDB Atlas    |
|  (React/Vite)  |      |    REST API    |      |   (Mongoose ODM)   |
+-------+--------+      +-------+--------+      +--------------------+
        |                        |
        | WebSocket              |
        v                        v
+----------------+      +----------------+      +--------------------+
|   Socket.io    |      |    RabbitMQ    |----->|   Queue Workers    |
|  (Real-time)   |      |   (4 Queues)  |      |   (In-process)     |
+----------------+      +-------+--------+      +--------------------+
                                |
                        +-------+-------+
                        v               v
                  +-----------+   +----------+
                  |   Redis   |   |  AWS S3  |
                  | (OTP/TTL) |   | (Files)  |
                  +-----------+   +----------+
```

**Queue Topology** - RabbitMQ manages 4 durable queues with in-process consumer workers:

| Queue                      | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `queue:transaction_alerts` | Real-time transaction notifications via Socket.io |
| `queue:chat_messages`      | Chat message persistence + Socket.io emission     |
| `queue:emails`             | OTP and Welcome email dispatch via Resend.io      |
| `queue:audit_logs`         | Asynchronous audit log persistence to MongoDB     |

> All queues include **graceful fallbacks** - if RabbitMQ is unavailable, processing happens inline (direct DB writes + Socket.io emissions).

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                        # Express app configuration & middleware
│   ├── server.js                     # Entry point: DB, Redis, RabbitMQ, Socket.io init
│   ├── config/
│   │   ├── db.js                     # MongoDB Atlas connection
│   │   ├── redis.js                  # Redis client setup
│   │   ├── rabbitmq.js               # RabbitMQ connection & channel management
│   │   ├── s3.js                     # AWS S3 client (with local fallback flag)
│   │   └── socket.js                 # Socket.io server with JWT auth middleware
│   ├── controllers/
│   │   ├── auth.controller.js        # Register, Login, Logout, OTP, Password Reset, 2FA Login
│   │   ├── user.controller.js        # Profile CRUD, User Search, KYC Submit, Profile Image
│   │   ├── account.controller.js     # Account CRUD, Balance, Freeze/Unfreeze, Disputes
│   │   ├── transaction.controller.js # Deposit, Withdraw, Transfer, History, PDF Statement, Approval
│   │   ├── tpin.controller.js        # Set, Change, Reset TPIN
│   │   ├── 2fa.controller.js         # 2FA Setup (QR), Enable, Disable
│   │   ├── dashboard.controller.js   # Summary API, Expenditure Analytics
│   │   ├── chat.controller.js        # Chat Rooms, Permission Check, Message History
│   │   ├── admin.controller.js       # System Stats, User Listing, KYC Queue, Role Mgmt
│   │   ├── upload.controller.js      # File Upload, Secure View, URL Generation
│   │   └── contact.controller.js     # Public Contact Form Submission
│   ├── models/
│   │   ├── user.model.js             # User schema (roles, KYC, 2FA, TPIN)
│   │   ├── account.model.js          # Account schema (Savings/Current, freeze dispute)
│   │   ├── transaction.model.js      # Transaction schema (Deposit/Withdraw/Transfer)
│   │   ├── message.model.js          # Chat message schema
│   │   ├── auditLog.model.js         # Audit log schema
│   │   └── contact.model.js          # Contact form submission schema
│   ├── routes/
│   │   ├── auth.routes.js            # /api/v1/auth/*
│   │   ├── user.routes.js            # /api/v1/users/*
│   │   ├── account.routes.js         # /api/v1/accounts/*
│   │   ├── transaction.routes.js     # /api/v1/transactions/*
│   │   ├── tpin.routes.js            # /api/v1/tpin/*
│   │   ├── 2fa.routes.js             # /api/v1/2fa/*
│   │   ├── dashboard.routes.js       # /api/v1/dashboard/*
│   │   ├── chat.routes.js            # /api/v1/chats/*
│   │   ├── admin.routes.js           # /api/v1/admin/*
│   │   ├── upload.routes.js          # /api/v1/uploads/*
│   │   └── contact.routes.js         # /api/v1/contact/*
│   ├── middleware/
│   │   ├── authMiddleware.js         # isAuth (JWT), verifyTPIN, checkRole
│   │   ├── rateLimiter.js            # Global (100/15min) & Auth (10/15min) rate limiters
│   │   ├── errorMiddleware.js        # Global error handler
│   │   ├── validate.js               # Zod schema validation middleware
│   │   ├── audit.middleware.js       # Audit log recording on successful requests
│   │   └── upload.middleware.js      # Multer file upload configuration
│   ├── validators/
│   │   ├── auth.validator.js         # Register, Login, OTP, Reset schemas
│   │   ├── user.validator.js         # Profile update, Search, KYC schemas
│   │   ├── account.validator.js      # Account creation, Status, Freeze schemas
│   │   ├── transaction.validator.js  # Deposit, Withdraw, Transfer, History schemas
│   │   ├── tpin.validator.js         # Set, Change, Reset TPIN schemas
│   │   ├── 2fa.validator.js          # 2FA toggle schema
│   │   ├── dashboard.validator.js    # Analytics query schema
│   │   ├── admin.validator.js        # Role update, KYC status, User list schemas
│   │   └── upload.validator.js       # File view/URL schemas
│   ├── utils/
│   │   ├── AppError.js               # Custom error class (statusCode + message)
│   │   ├── jwt.utils.js              # Access & Refresh token generation
│   │   ├── otp.util.js               # OTP generation, Redis storage (TTL), verification
│   │   ├── encryption.util.js        # AES-256 encrypt/decrypt for TOTP secrets
│   │   ├── mailer.js                 # HTML email templates (OTP, Welcome, Contact)
│   │   ├── s3.helper.js              # S3 upload, pre-signed URLs, local fallback + HMAC
│   │   ├── queue.js                  # RabbitMQ producers + consumer workers (4 queues)
│   │   ├── transaction.util.js       # Mongoose transaction wrapper with retry logic
│   │   ├── chat.util.js              # Chat permission check (transaction-based)
│   │   └── generate-qr.js           # QR code generation utility
│   ├── templates/
│   │   └── statement.ejs             # PDF bank statement EJS template
│   └── scripts/
│       ├── seed.js                   # Database seeder (users + accounts)
│       └── fix-indices.js            # MongoDB index maintenance script
├── tests/                            # Integration/E2E test suite
│   ├── admin.test.js
│   ├── analytics.test.js
│   ├── chat.test.js
│   ├── concurrency.js
│   ├── kyc.test.js
│   ├── notifications.test.js
│   ├── otp.test.js
│   ├── reset-password.test.js
│   ├── reset-tpin.test.js
│   ├── role-dashboards.test.js
│   ├── s3.test.js
│   ├── security.test.js
│   ├── user-profile.test.js
│   └── welcome-email.test.js
├── uploads/                          # Local file storage fallback directory
├── .env.example                      # Environment variable template
├── package.json
└── README.md                         # ← You are here
```

---

## Getting Started

### Prerequisites

| Dependency | Version | Purpose                                                  |
| ---------- | ------- | -------------------------------------------------------- |
| Node.js    | ≥ 18.x  | JavaScript runtime                                       |
| MongoDB    | Atlas   | Primary database (replica set required for transactions) |
| Redis      | ≥ 6.x   | OTP storage with TTL expiration                          |
| RabbitMQ   | ≥ 3.x   | Message queue (optional - has fallbacks)                 |
| Chromium   | Latest  | Required by Puppeteer for PDF generation                 |

### Installation

```bash
# Clone the repository
git clone https://github.com/rishi-tiwari023/portalrupee.git
cd portalrupee/backend

# Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                 | Required | Description                                               |
| ------------------------ | -------- | --------------------------------------------------------- |
| `PORT`                   | No       | Server port (default: `5000`)                             |
| `NODE_ENV`               | No       | `development` or `production`                             |
| `MONGODB_URI`            | **Yes**  | MongoDB Atlas connection string (must be replica set)     |
| `FRONTEND_URL`           | No       | CORS origin (default: `http://localhost:5173`)            |
| `JWT_SECRET`             | **Yes**  | Secret key for signing access tokens                      |
| `JWT_EXPIRES_IN`         | No       | Access token expiry (default: `1d`)                       |
| `JWT_REFRESH_SECRET`     | **Yes**  | Secret key for signing refresh tokens                     |
| `JWT_REFRESH_EXPIRES_IN` | No       | Refresh token expiry (default: `7d`)                      |
| `REDIS_URL`              | **Yes**  | Redis connection URL                                      |
| `TOTP_ENCRYPTION_KEY`    | **Yes**  | AES-256 key for encrypting TOTP secrets at rest           |
| `RESEND_API_KEY`         | No       | Resend.io API key (falls back to console mock)            |
| `EMAIL_FROM`             | No       | Sender email address                                      |
| `ADMIN_EMAIL`            | No       | Admin email to receive contact form notifications         |
| `AWS_ACCESS_KEY_ID`      | No       | AWS credentials for S3                                    |
| `AWS_SECRET_ACCESS_KEY`  | No       | AWS credentials for S3                                    |
| `AWS_REGION`             | No       | AWS region (default: `ap-south-1`)                        |
| `AWS_S3_BUCKET`          | No       | S3 bucket name                                            |
| `USE_LOCAL_S3_FALLBACK`  | No       | Set to `true` to use local filesystem instead of S3       |
| `RABBITMQ_URL`           | No       | RabbitMQ connection URL (falls back to inline processing) |

### Database Seeding

Populate the database with test users and accounts:

```bash
npm run seed
```

This creates 4 users and 3 accounts (see [Seeded Test Accounts](#seeded-test-accounts)).

### Running the Server

```bash
# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start
```

The server will:

1. Connect to MongoDB Atlas
2. Connect to Redis
3. Connect to RabbitMQ and start queue consumer workers
4. Start Express HTTP server on the configured port
5. Initialize Socket.io on the same HTTP server

### Postman Collection

A complete Postman Collection is available to easily test all 50+ endpoints, containing pre-filled payloads and automatic JWT token handling.

1. Open Postman.
2. Click **Import** and select the file located at: `docs/PortalRupee.postman_collection.json`
3. Expand the **PortalRupee API** collection.
4. Run the **Login** request first - a test script will automatically extract your JWT and inject it into all subsequent requests.

---

## API Reference

**Base URL:** `/api/v1`

All protected routes require a valid JWT token sent as:

- `Authorization: Bearer <token>` header, **or**
- `jwt` HTTP-only cookie (set automatically on login/register)

---

### 1. Authentication

| Method | Endpoint                  | Access | Rate Limited | Description                                                                        |
| ------ | ------------------------- | ------ | ------------ | ---------------------------------------------------------------------------------- |
| POST   | `/auth/register`          | Public | ✅ (10/15m)  | Register a new user                                                                |
| POST   | `/auth/login`             | Public | ✅ (10/15m)  | Login (returns `requires2FA` if enabled)                                           |
| POST   | `/auth/logout`            | Public | -            | Clear JWT cookie                                                                   |
| POST   | `/auth/verify-2fa`        | Public | ✅ (10/15m)  | Verify TOTP token during login                                                     |
| POST   | `/auth/disable-2fa-login` | Public | ✅ (10/15m)  | Disable 2FA via OTP (for locked-out users)                                         |
| POST   | `/auth/send-otp`          | Public | ✅ (10/15m)  | Send OTP email (purpose: `general`, `password_reset`, `tpin_reset`, `disable_2fa`) |
| POST   | `/auth/verify-otp`        | Public | ✅ (10/15m)  | Verify OTP code                                                                    |
| POST   | `/auth/reset-password`    | Public | ✅ (10/15m)  | Reset password (requires prior OTP verification)                                   |

**Register** - `POST /auth/register`

```json
{
  "firstName": "Rishi",
  "lastName": "Tiwari",
  "email": "rishi@example.com",
  "mobile": "9876543210",
  "password": "SecurePassword@123",
  "role": "CUSTOMER"
}
```

- Passwords are hashed with bcrypt (12 rounds)
- A welcome email is queued via RabbitMQ
- JWT is set as an HTTP-only cookie
- Returns access + refresh tokens

**Login** - `POST /auth/login`

```json
{
  "email": "rishi@example.com",
  "password": "SecurePassword@123"
}
```

- If 2FA is enabled, returns `{ requires2FA: true, email }` instead of tokens
- Attaches account freeze status (`isCompletelyFrozen`, `isPartiallyFrozen`) to the user object
- Updates `lastLogin` timestamp

---

### 2. User Management

> All routes require authentication (`isAuth`).

| Method | Endpoint               | Access  | Audit Logged | Description                                            |
| ------ | ---------------------- | ------- | ------------ | ------------------------------------------------------ |
| GET    | `/users/profile`       | Private | -            | Get current user profile + accounts + freeze status    |
| PATCH  | `/users/profile`       | Private | ✅           | Update profile (firstName, lastName, email, mobile)    |
| PATCH  | `/users/profile/image` | Private | ✅           | Update profile image S3 key                            |
| GET    | `/users/search`        | Private | -            | Search users by name, email, mobile, or account number |
| POST   | `/users/kyc`           | Private | ✅           | Submit KYC documents (ID + signature S3 keys)          |

**Search Users** - `GET /users/search?query=rishi`

- Searches across `firstName`, `lastName`, `email`, `mobile`, and linked `accountNumber`
- Excludes the requesting user from results
- Used in the Transfer flow to find recipients

---

### 3. TPIN Management

> All routes require authentication. TPIN is a 6-digit Transaction PIN.

| Method | Endpoint       | Access  | Description                                |
| ------ | -------------- | ------- | ------------------------------------------ |
| POST   | `/tpin/set`    | Private | Set TPIN (one-time, errors if already set) |
| PUT    | `/tpin/change` | Private | Change TPIN (requires current TPIN)        |
| POST   | `/tpin/reset`  | Private | Reset TPIN via OTP verification            |

- TPIN is hashed with bcrypt (12 rounds) before storage
- Required for peer-to-peer transfers (`verifyTPIN` middleware)
- Reset flow: Send OTP -> Verify OTP -> Reset TPIN

---

### 4. Two-Factor Authentication (2FA)

> All routes require authentication. Uses TOTP (Time-based One-Time Password) via authenticator apps.

| Method | Endpoint       | Access  | Description                                        |
| ------ | -------------- | ------- | -------------------------------------------------- |
| GET    | `/2fa/setup`   | Private | Get QR code + secret for authenticator app binding |
| POST   | `/2fa/enable`  | Private | Enable 2FA (requires valid TOTP token)             |
| POST   | `/2fa/disable` | Private | Disable 2FA (requires valid TOTP token)            |

- TOTP secrets are encrypted at rest using AES-256-CBC (`TOTP_ENCRYPTION_KEY`)
- QR code is returned as a data URL for direct rendering
- When 2FA is enabled, login requires an additional TOTP verification step
- Deposit, Withdraw, Transfer, and Balance Check also require TOTP if 2FA is active

---

### 5. Account Management

> All routes require authentication.

| Method | Endpoint                          | Access          | Audit Logged | Description                                  |
| ------ | --------------------------------- | --------------- | ------------ | -------------------------------------------- |
| POST   | `/accounts`                       | Private         | ✅           | Create account (SAVINGS or CURRENT)          |
| GET    | `/accounts`                       | Private         | -            | List own accounts                            |
| GET    | `/accounts/:id`                   | Private         | -            | Get account details                          |
| POST   | `/accounts/:id/balance`           | Private         | -            | Check balance (TOTP required if 2FA enabled) |
| GET    | `/accounts/number/:accountNumber` | Private         | -            | Lookup account by number                     |
| GET    | `/accounts/admin/all`             | Manager         | -            | List all accounts (paginated)                |
| PATCH  | `/accounts/:id/status`            | Manager         | ✅           | Update status (ACTIVE/BLOCKED/CLOSED)        |
| PATCH  | `/accounts/:id/freeze`            | Manager         | ✅           | Freeze account (set BLOCKED)                 |
| PATCH  | `/accounts/:id/unfreeze`          | Manager         | ✅           | Unfreeze account (set ACTIVE)                |
| POST   | `/accounts/:id/dispute`           | Private (Owner) | ✅           | Submit freeze dispute message                |
| GET    | `/accounts/disputes`              | Manager         | -            | View all freeze disputes                     |

- Account numbers are 12-digit random unique strings
- Each user can have one Savings and one Current account
- Accounts cannot be closed if balance > 0
- Managers cannot freeze/unfreeze their own accounts

---

### 6. Transactions

> All routes require authentication.

| Method | Endpoint                         | Access            | Audit Logged | Description                                                     |
| ------ | -------------------------------- | ----------------- | ------------ | --------------------------------------------------------------- |
| POST   | `/transactions/deposit`          | Private           | ✅           | Deposit funds (pending if customer, instant if cashier/manager) |
| POST   | `/transactions/withdraw`         | Private           | ✅           | Withdraw funds (account owner or manager)                       |
| POST   | `/transactions/transfer`         | Private (TPIN)    | ✅           | P2P transfer (requires TPIN verification)                       |
| GET    | `/transactions`                  | Private           | -            | Transaction history (filtered, paginated)                       |
| GET    | `/transactions/statement`        | Private           | -            | Generate PDF bank statement                                     |
| GET    | `/transactions/pending-deposits` | Cashier / Manager | -            | List pending deposit approvals                                  |
| PATCH  | `/transactions/:id/approve`      | Cashier / Manager | ✅           | Approve or reject a pending deposit                             |

**Deposit** - `POST /transactions/deposit`

```json
{
  "accountNumber": "1000000001",
  "amount": 5000,
  "description": "Salary credit",
  "totpToken": "123456" // Required only if 2FA is enabled
}
```

- Customer deposits are set to `PENDING` status and require Cashier/Manager approval
- Cashier/Manager deposits are processed immediately with `SUCCESS` status
- All operations use MongoDB sessions for atomicity with write-conflict retry (up to 5 attempts with exponential backoff)

**Transfer** - `POST /transactions/transfer`

```json
{
  "receiverId": "64abc...",
  "amount": 1000,
  "description": "Dinner split",
  "tpin": "111111",
  "senderAccountId": "64def...", // Optional: defaults to first active account
  "totpToken": "654321" // Required only if 2FA is enabled
}
```

- Atomic debit-credit within a single MongoDB transaction
- Both sender and receiver receive real-time Socket.io notifications via RabbitMQ

**Transaction History** - `GET /transactions`

| Query Param | Type   | Description                             |
| ----------- | ------ | --------------------------------------- |
| `page`      | Number | Page number (default: 1)                |
| `limit`     | Number | Items per page (default: 10, max: 100)  |
| `type`      | String | `DEPOSIT`, `WITHDRAW`, `TRANSFER`       |
| `status`    | String | `PENDING`, `SUCCESS`, `FAILED`          |
| `startDate` | Date   | Filter from date                        |
| `endDate`   | Date   | Filter to date                          |
| `minAmount` | Number | Minimum amount filter                   |
| `maxAmount` | Number | Maximum amount filter                   |
| `search`    | String | Search by transaction ID or description |
| `userId`    | String | Filter by user (Cashier/Manager only)   |

- Customers see only their own transactions (scoped by sender/receiver/account)
- Cashiers and Managers can view any user's transactions

**PDF Statement** - `GET /transactions/statement`

| Query Param | Type   | Description          |
| ----------- | ------ | -------------------- |
| `accountId` | String | Account ID           |
| `startDate` | Date   | Statement start date |
| `endDate`   | Date   | Statement end date   |

- Returns a downloadable PDF rendered from an EJS template via Puppeteer
- Transactions are listed chronologically with credit/debit classification

---

### 7. Dashboard & Analytics

> All routes require authentication.

| Method | Endpoint               | Access  | Description                              |
| ------ | ---------------------- | ------- | ---------------------------------------- |
| GET    | `/dashboard/summary`   | Private | Account balances, count, recent activity |
| GET    | `/dashboard/analytics` | Private | Expenditure analytics & spending trends  |

**Analytics** - `GET /dashboard/analytics`

| Query Param | Type   | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| `timeRange` | String | `7d`, `30d`, `12m`, or `custom` (default: `30d`) |
| `startDate` | Date   | Required when `timeRange=custom`                 |
| `endDate`   | Date   | Required when `timeRange=custom`                 |

Returns:

- **Summary** - Total spent, previous period comparison, percentage change, average/max transaction size
- **Spending Trend** - Daily or monthly totals with zero-filled gaps
- **Category Breakdown** - Auto-categorized by transaction description (Food & Dining, Utilities & Bills, Shopping, Travel & Transport, Investment & Savings, Transfer Out, Cash Withdrawal, Other)
- **Type Breakdown** - Split by transaction type
- **Inflow vs Outflow** - Net savings calculation

> Category detection uses regex matching against transaction descriptions (e.g., "swiggy", "electricity" -> auto-categorized).

---

### 8. Chat & Messaging

> All HTTP routes require authentication. WebSocket events require JWT cookie.

| Method | Endpoint                          | Access  | Description                   |
| ------ | --------------------------------- | ------- | ----------------------------- |
| GET    | `/chats/rooms`                    | Private | List available chat rooms     |
| GET    | `/chats/permission/:targetUserId` | Private | Check if messaging is allowed |
| GET    | `/chats/:targetUserId/messages`   | Private | Get paginated message history |

**Permission Model:**

- Messaging is allowed **only** if a `TRANSFER` transaction exists between the two users
- Chat rooms are sorted by most recent activity (last transaction or message)
- Messages are marked as read when fetched

---

### 9. File Uploads (S3 / Local)

| Method | Endpoint             | Access   | Description                            |
| ------ | -------------------- | -------- | -------------------------------------- |
| POST   | `/uploads`           | Private  | Upload file (multipart, field: `file`) |
| GET    | `/uploads/view/:key` | Public\* | View/download file                     |
| GET    | `/uploads/url/:key`  | Private  | Get pre-signed URL (JSON response)     |

- Files are stored in **AWS S3** or **local filesystem** (based on `USE_LOCAL_S3_FALLBACK`)
- Each file receives a UUID-based unique key
- Pre-signed URLs expire after 15 minutes
- Local fallback uses HMAC-SHA256 signature verification for secure serving
- Used for KYC documents (ID proof + signature) and profile images

> \* View endpoint is publicly accessible but secured via HMAC signatures (local) or S3 pre-signed URLs (AWS).

---

### 10. Admin / Manager Panel

> All routes require authentication + `MANAGER` role.

| Method | Endpoint                    | Access  | Audit Logged | Description                                  |
| ------ | --------------------------- | ------- | ------------ | -------------------------------------------- |
| GET    | `/admin/stats`              | Manager | -            | System-wide statistics                       |
| GET    | `/admin/users`              | Manager | -            | List users (filtered, paginated, searchable) |
| GET    | `/admin/kyc/queue`          | Manager | -            | KYC pending approval queue (FIFO)            |
| PATCH  | `/admin/users/:id/kyc`      | Manager | ✅           | Approve/Reject KYC                           |
| PATCH  | `/admin/users/:userId/role` | Manager | -            | Change user role                             |

**System Stats** - Returns:

- User counts by role (`CUSTOMER`, `CASHIER`, `MANAGER`)
- KYC status distribution (`NOT_STARTED`, `PENDING`, `VERIFIED`, `REJECTED`)
- Total accounts & aggregate balance
- Transaction counts, volume, breakdown by type and status
- 10 most recent transactions and audit logs

**User Listing** - `GET /admin/users`

| Query Param | Type   | Description                   |
| ----------- | ------ | ----------------------------- |
| `page`      | Number | Page number                   |
| `limit`     | Number | Items per page                |
| `role`      | String | Filter by role                |
| `kycStatus` | String | Filter by KYC status          |
| `search`    | String | Search by name, email, mobile |

---

### 11. Contact Form

| Method | Endpoint   | Access | Description                   |
| ------ | ---------- | ------ | ----------------------------- |
| POST   | `/contact` | Public | Submit a contact form message |

```json
{
  "name": "Gagan Gupta",
  "email": "gagan@example.com",
  "subject": "Account inquiry",
  "message": "I need help with my account setup."
}
```

- Validated with Zod (min lengths, email format, max 2000 chars for message)
- Saved to MongoDB (`Contact` collection) with `NEW` status
- Sends notification email to admin (non-blocking)

---

### 12. Health Check

| Method | Endpoint         | Access | Description         |
| ------ | ---------------- | ------ | ------------------- |
| GET    | `/health` (Root) | Public | Server health check |

```json
{
  "status": "success",
  "message": "PortalRupee Backend is healthy!",
  "timestamp": "2026-06-19T15:30:00.000Z"
}
```

---

## Data Models

### User

| Field              | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| `firstName`        | String  | Required                                         |
| `lastName`         | String  | Required                                         |
| `email`            | String  | Required, unique, lowercase                      |
| `mobile`           | String  | Required, unique                                 |
| `password`         | String  | Hashed (bcrypt 12), `select: false`              |
| `tpin`             | String  | Hashed (bcrypt 12), `select: false`              |
| `tpinSet`          | Boolean | Whether TPIN has been configured                 |
| `role`             | Enum    | `CUSTOMER` (default), `CASHIER`, `MANAGER`       |
| `twoFactorEnabled` | Boolean | Whether TOTP 2FA is active                       |
| `twoFactorSecret`  | String  | AES-256 encrypted TOTP secret, `select: false`   |
| `kycStatus`        | Enum    | `NOT_STARTED`, `PENDING`, `VERIFIED`, `REJECTED` |
| `kycDocumentKey`   | String  | S3 key for KYC ID document                       |
| `kycSignatureKey`  | String  | S3 key for KYC signature                         |
| `profileImageKey`  | String  | S3 key for profile image                         |
| `lastLogin`        | Date    | Last login timestamp                             |

**Indexes:** `{ kycStatus, updatedAt }`, `{ role, createdAt }`, `{ createdAt }`

### Account

| Field           | Type     | Description                                  |
| --------------- | -------- | -------------------------------------------- |
| `user`          | ObjectId | Reference to User                            |
| `accountNumber` | String   | 12-digit unique account number               |
| `accountType`   | Enum     | `SAVINGS`, `CURRENT`                         |
| `balance`       | Number   | Non-negative (min: 0)                        |
| `status`        | Enum     | `ACTIVE`, `BLOCKED`, `CLOSED`                |
| `freezeDispute` | String   | Customer dispute message for frozen accounts |

**Indexes:** `{ user }`

### Transaction

| Field             | Type     | Description                                         |
| ----------------- | -------- | --------------------------------------------------- |
| `sender`          | ObjectId | User who initiated                                  |
| `receiver`        | ObjectId | Recipient user                                      |
| `senderAccount`   | ObjectId | Source account (required for Withdraw/Transfer)     |
| `receiverAccount` | ObjectId | Destination account (required for Deposit/Transfer) |
| `amount`          | Number   | Transaction amount (min: 1)                         |
| `type`            | Enum     | `DEPOSIT`, `WITHDRAW`, `TRANSFER`                   |
| `status`          | Enum     | `PENDING`, `SUCCESS`, `FAILED`                      |
| `description`     | String   | Optional transaction note                           |
| `transactionId`   | String   | Auto-generated unique ID (`TXN-XXXXXXXX`)           |
| `metadata`        | Map      | Extensible key-value metadata                       |

**Indexes:** `{ sender, createdAt }`, `{ receiver, createdAt }`, `{ senderAccount, createdAt }`, `{ receiverAccount, createdAt }`

### Message

| Field      | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `sender`   | ObjectId | Message sender                |
| `receiver` | ObjectId | Message recipient             |
| `roomId`   | String   | Deterministic room ID         |
| `content`  | String   | Message text                  |
| `read`     | Boolean  | Read receipt (default: false) |

**Indexes:** `{ roomId, createdAt }`, `{ sender }`, `{ receiver }`

### AuditLog

| Field        | Type     | Description                           |
| ------------ | -------- | ------------------------------------- |
| `actor`      | ObjectId | User who performed the action         |
| `action`     | String   | Action name (e.g., `DEPOSIT`)         |
| `resource`   | String   | Resource type (e.g., `TRANSACTION`)   |
| `resourceId` | String   | ID of the affected resource           |
| `details`    | Mixed    | Request method, URL, body (sanitized) |
| `ipAddress`  | String   | Client IP address                     |
| `userAgent`  | String   | Client user-agent                     |
| `status`     | Enum     | `SUCCESS`, `FAILURE`                  |

**Indexes:** `{ actor, createdAt }`, `{ resource, resourceId }`, `{ action }`

### Contact

| Field     | Type   | Description                |
| --------- | ------ | -------------------------- |
| `name`    | String | Submitter name (max: 100)  |
| `email`   | String | Submitter email            |
| `subject` | String | Message subject (max: 200) |
| `message` | String | Message body (max: 2000)   |
| `status`  | Enum   | `NEW`, `READ`, `RESOLVED`  |

**Indexes:** `{ status, createdAt }`

---

## Middleware

| Middleware                      | Applied To       | Description                                       |
| ------------------------------- | ---------------- | ------------------------------------------------- |
| `helmet()`                      | Global           | Sets security HTTP headers                        |
| `cors()`                        | Global           | CORS with credentials for frontend origin         |
| `compression()`                 | Global           | Gzip/Brotli response compression                  |
| `express.json()`                | Global           | JSON body parser (10kb limit)                     |
| `cookieParser()`                | Global           | Parse JWT from HTTP-only cookies                  |
| `expressMongoSanitize()`        | Global           | Prevents NoSQL injection via `$` operators        |
| `hpp()`                         | Global           | HTTP Parameter Pollution protection               |
| `morgan('dev')`                 | Development only | Request logging                                   |
| `globalLimiter`                 | Global           | 100 requests per IP per 15 minutes                |
| `authLimiter`                   | Auth routes      | 10 requests per IP per 15 minutes                 |
| `isAuth`                        | Protected routes | JWT verification (Bearer header or cookie)        |
| `checkRole(...roles)`           | Role-restricted  | RBAC enforcement (variadic roles)                 |
| `verifyTPIN`                    | Transfer route   | Validates bcrypt-hashed TPIN from request body    |
| `validate(schema)`              | Validated routes | Zod schema validation on `req.body` / `req.query` |
| `auditLogger(action, resource)` | Mutating routes  | Async audit log on successful (2xx) responses     |
| `upload.single('file')`         | Upload route     | Multer memory storage for multipart file uploads  |

---

## Real-time Events (Socket.io)

**Connection Authentication:** JWT extracted from HTTP-only cookie, verified with `jsonwebtoken`, user attached to socket.

### Client -> Server Events

| Event          | Payload                     | Description                            |
| -------------- | --------------------------- | -------------------------------------- |
| `join_chat`    | `{ targetUserId }`          | Join a permission-gated chat room      |
| `send_message` | `{ targetUserId, content }` | Send a message (enqueued via RabbitMQ) |
| `typing`       | `{ roomId }`                | Broadcast typing indicator             |
| `stop_typing`  | `{ roomId }`                | Clear typing indicator                 |

### Server -> Client Events

| Event                          | Payload                                                        | Description                |
| ------------------------------ | -------------------------------------------------------------- | -------------------------- |
| `receive_message`              | Full message document                                          | New chat message in room   |
| `new_message_notification`     | Full message document                                          | Notification for recipient |
| `new_transaction_notification` | `{ transactionId, type, subType, amount, message, createdAt }` | Transaction alert          |
| `typing`                       | `{ userId }`                                                   | Typing indicator           |
| `stop_typing`                  | `{ userId }`                                                   | Stop typing indicator      |

**Room Strategy:**

- Each user joins a personal room (`userId`) for direct notifications
- Chat rooms use deterministic IDs: `chat_${sorted([userId1, userId2]).join('_')}`

---

## Message Queue (RabbitMQ)

The system uses 4 durable RabbitMQ queues with persistent messages:

| Queue                      | Producer                       | Consumer Action                          |
| -------------------------- | ------------------------------ | ---------------------------------------- |
| `queue:transaction_alerts` | Transaction controller         | Emit Socket.io notification to user room |
| `queue:chat_messages`      | Socket.io `send_message` event | Persist to MongoDB + emit to room        |
| `queue:emails`             | Auth controller (OTP, Welcome) | Send email via Resend.io SMTP            |
| `queue:audit_logs`         | Audit middleware               | Persist `AuditLog` document to MongoDB   |

**Fallback Behavior:** If RabbitMQ is unavailable, all operations execute inline:

- Transaction alerts -> direct Socket.io emit
- Chat messages -> direct MongoDB insert + Socket.io emit
- Emails -> direct Nodemailer send
- Audit logs -> direct MongoDB insert

---

## Email System

| Email Type           | Trigger                 | Template                             |
| -------------------- | ----------------------- | ------------------------------------ |
| Welcome              | User registration       | Premium HTML with feature highlights |
| OTP (General)        | Send OTP request        | Branded card with 6-digit code       |
| OTP (Password Reset) | Password reset flow     | Red-themed alert card                |
| OTP (TPIN Reset)     | TPIN reset flow         | Blue-themed alert card               |
| OTP (Disable 2FA)    | 2FA disable flow        | Orange-themed alert card             |
| Contact Notification | Contact form submission | Admin notification with details      |

**Transport:**

- **Production:** Resend.io SMTP (`smtp.resend.com:465`, TLS)
- **Development:** Mock transporter that logs emails to console (including OTP codes for easy testing)

---

## Security

| Feature                    | Implementation                                                               |
| -------------------------- | ---------------------------------------------------------------------------- |
| Password Hashing           | bcrypt with 12 salt rounds                                                   |
| TPIN Hashing               | bcrypt with 12 salt rounds                                                   |
| JWT Authentication         | HTTP-only, Secure (production), SameSite cookies                             |
| TOTP Secrets at Rest       | AES-256-CBC encryption                                                       |
| Request Validation         | Zod schemas on all endpoints                                                 |
| NoSQL Injection Prevention | express-mongo-sanitize                                                       |
| HTTP Security Headers      | Helmet.js                                                                    |
| Parameter Pollution        | HPP                                                                          |
| Rate Limiting              | Global (100/15min), Auth routes (10/15min)                                   |
| CORS                       | Whitelisted frontend origin with credentials                                 |
| File Access Control        | HMAC-SHA256 signed URLs (local) / S3 pre-signed URLs                         |
| Body Size Limit            | 10kb JSON payload limit                                                      |
| Sensitive Field Redaction  | Audit logs strip `password`, `tpin`, `totpToken`                             |
| Transaction Atomicity      | MongoDB sessions with write-conflict retry (5 attempts, exponential backoff) |
| Unhandled Error Recovery   | Global process listeners for `unhandledRejection` and `uncaughtException`    |

---

## Seeded Test Accounts

Run `npm run seed` to create:

| Role     | Email                       | Password       | TPIN   | Accounts                              |
| -------- | --------------------------- | -------------- | ------ | ------------------------------------- |
| MANAGER  | `manager@portalrupee.com`   | `Password@123` | -      | -                                     |
| CASHIER  | `cashier@portalrupee.com`   | `Password@123` | -      | -                                     |
| CUSTOMER | `customer@portalrupee.com`  | `Password@123` | 111111 | Savings (₹45,000) + Current (₹15,300) |
| CUSTOMER | `customer2@portalrupee.com` | `Password@123` | 111111 | Savings (₹5,000)                      |

> Seed uses upsert logic - running it multiple times is safe and will not duplicate data.

---

## Scripts

| Command        | Description                                |
| -------------- | ------------------------------------------ |
| `npm run dev`  | Start development server with nodemon      |
| `npm start`    | Start production server                    |
| `npm run seed` | Seed database with test users and accounts |
| `npm run lint` | Run ESLint                                 |
