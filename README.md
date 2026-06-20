# PortalRupee

> A full-stack digital banking platform with real-time messaging, role-based dashboards, event-driven architecture, and enterprise-grade security.

![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-5.x-DC382D?logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.x-FF6600?logo=rabbitmq&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

**Detailed Documentation:** [Backend README](backend/README.md) | [Frontend README](frontend/README.md)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Architecture Preview](#architecture-preview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Customer Features](#customer-features)
  - [Cashier Features](#cashier-features)
  - [Manager Features](#manager-features)
  - [Public Pages](#public-pages)
  - [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Docker Compose (Infrastructure)](#docker-compose-infrastructure)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Authors](#authors)
- [License](#license)

---

## Overview

PortalRupee is a full-featured digital banking web application built as a capstone project. It simulates a real banking environment with three user roles (Customer, Cashier, Manager), each with distinct dashboards and capabilities.

The system is built on a modern event-driven architecture. The **backend** is an Express.js REST API powered by MongoDB Atlas, Redis, RabbitMQ (4 durable message queues), and Socket.io for real-time communication. The **frontend** is a React 19 SPA built with Vite, styled with Tailwind CSS, and state-managed through Redux Toolkit with 6 domain slices. Authentication uses JWT tokens stored in HTTP-only cookies with TOTP-based Two-Factor Authentication via authenticator apps.

**Core banking operations** (deposits, withdrawals, peer-to-peer transfers) execute as atomic MongoDB transactions with write-conflict retry logic (up to 5 attempts with exponential backoff). Customer deposits require Cashier or Manager approval before funds are credited. All financial mutations are tracked through a comprehensive audit logging system.

**Real-time features** include Socket.io-powered transaction notifications, permission-based chat (messaging allowed only between users who have transacted with each other), and live typing indicators. RabbitMQ decouples processing for transaction alerts, chat message persistence, email dispatch, and audit logs, with graceful inline fallbacks if the queue is unavailable.

---

## Live Demo

| Service  | URL                              |
| -------- | -------------------------------- |
| Frontend | https://portalrupee.vercel.app   |
| Backend  | http://35.154.77.142:5000/health |

**Test Accounts** (run `npm run seed` in the backend to create these):

| Role     | Email                       | Password       | TPIN   |
| -------- | --------------------------- | -------------- | ------ |
| MANAGER  | `manager@portalrupee.com`   | `Password@123` | -      |
| CASHIER  | `cashier@portalrupee.com`   | `Password@123` | -      |
| CUSTOMER | `customer@portalrupee.com`  | `Password@123` | 111111 |
| CUSTOMER | `customer2@portalrupee.com` | `Password@123` | 111111 |

---

## Architecture Preview

```
+------------------+       HTTPS       +------------------+       Mongoose       +-------------------+
|                  | <===============> |                  | <=================> |                   |
|   React 19 SPA   |                   |   Express.js     |                     |  MongoDB Atlas    |
|   (Vite + RTK)   |   REST + Cookies  |   REST API       |   Atomic Sessions   |  (Replica Set)    |
|                  |                   |                  |                     |                   |
+--------+---------+                   +--------+---------+                     +-------------------+
         |                                      |
         | Socket.io                             | AMQP
         | (WebSocket)                           |
         v                                      v
+------------------+                   +-------------------+       Workers       +-------------------+
|                  |                   |                   | ==================> |                   |
|   Socket.io      |                   |    RabbitMQ       |                     |  Queue Consumers  |
|   (Real-time)    |                   |   (4 Queues)      |   In-process        | (Alerts, Chat,    |
|                  |                   |                   |                     |  Email, Audit)    |
+------------------+                   +-------------------+                     +-------------------+
                                                |
                                       +--------+--------+
                                       |                 |
                                       v                 v
                                +------------+    +------------+
                                |            |    |            |
                                |   Redis    |    |   AWS S3   |
                                | (OTP/TTL)  |    |  (Files)   |
                                |            |    |            |
                                +------------+    +------------+
```

**Message Queue Topology:**

| Queue                      | Producer               | Consumer Action                          |
| -------------------------- | ---------------------- | ---------------------------------------- |
| `queue:transaction_alerts` | Transaction controller | Emit Socket.io notification to user room |
| `queue:chat_messages`      | Socket.io send_message | Persist to MongoDB + emit to chat room   |
| `queue:emails`             | Auth controller        | Send email via Resend.io SMTP            |
| `queue:audit_logs`         | Audit middleware       | Persist AuditLog document to MongoDB     |

---

## Tech Stack

### Backend

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

### Frontend

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | React 19.x                                    |
| Build Tool       | Vite 7.x                                      |
| Styling          | Tailwind CSS 4.x (class-based dark mode)      |
| State Management | Redux Toolkit 2.x + React-Redux 9.x           |
| Routing          | React Router DOM 7.x                          |
| HTTP Client      | Axios (with interceptors for auth and errors) |
| Form Handling    | Formik 2.x + Zod 3.x (via zod-formik-adapter) |
| Charts           | Recharts 3.x                                  |
| Real-time        | Socket.io Client 4.x                          |
| Animations       | Framer Motion 12.x, Anime.js 4.x              |
| Icons            | Lucide React, React Icons                     |
| Notifications    | React Toastify 11.x                           |

### Infrastructure

| Tool           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| Docker Compose | Orchestrate backend, Redis, and RabbitMQ containers |
| GitHub Actions | CI pipeline (lint) + CD pipeline (Docker + EC2)     |
| AWS EC2        | Backend hosting (t3.medium, Ubuntu 26.04)           |
| Vercel         | Frontend hosting (SPA with rewrites)                |
| Playwright     | End-to-end testing framework                        |

---

## Features

### Customer Features

- **Dashboard** with total balance card, account overview, quick actions (Add Funds, Withdraw, Send Money, Statements), and recent transaction feed
- **Account Management** allowing creation of Savings and Current accounts, balance inquiry (with TOTP if 2FA enabled), and KYC status tracking
- **Peer-to-Peer Transfers** with multi-step flow: search recipient by name/email/mobile/account number, enter amount, verify 6-digit TPIN, confirm and submit
- **Transaction History** with paginated table, filters (type, status, date range, amount range), search by transaction ID, and downloadable PDF bank statements
- **Expenditure Analytics** with spending trend charts, auto-categorized expense breakdown (Food and Dining, Utilities, Shopping, Travel, Investment, etc.), inflow vs outflow comparison, and configurable time ranges
- **Real-time Chat** with permission-based rooms (only users who have transacted can message each other), typing indicators, and message notifications
- **KYC Document Submission** with drag-and-drop file upload for ID proof and signature, image preview, and status tracking
- **Profile Management** with editable personal information, profile image upload (stored in S3), and last login display
- **Security Setup** including TPIN configuration wizard, TPIN reset via OTP, TOTP-based 2FA setup with QR code, and 2FA disable via email OTP
- **Account Freeze Dispute** submission for customers whose accounts have been frozen by a manager

### Cashier Features

- **Deposit Approval Queue** showing all pending customer deposit requests with approve/reject actions, depositor details, and amounts
- **Profile and Settings** management

### Manager Features

- **User Management** with paginated user listing, search by name/email/mobile, filter by role and KYC status, inline role changes, and KYC approval/rejection
- **Account Freeze/Unfreeze** controls for managing user account statuses
- **Freeze Dispute Review** for processing dispute messages from frozen account holders
- **System Statistics** including user counts by role, KYC distribution, total accounts, aggregate balances, transaction volumes, and recent audit logs
- **Profile and Settings** management

### Public Pages

- **Landing Page** with EMI (Equated Monthly Installment) calculator and RBI guideline summary
- **What is PortalRupee** explainer page
- **Contact Us** form (validated, saved to DB, admin notified via email)
- **Terms and Conditions** page
- **Banking Guidelines** page
- **Interest Information** page

### Security Features

| Feature                    | Implementation                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| Password Hashing           | bcrypt with 12 salt rounds                                                     |
| TPIN Hashing               | bcrypt with 12 salt rounds                                                     |
| JWT Authentication         | HTTP-only, Secure (production), SameSite cookies                               |
| TOTP 2FA                   | Speakeasy + QR code, secrets encrypted at rest with AES-256-CBC                |
| OTP Verification           | 6-digit codes stored in Redis with TTL, sent via Resend.io SMTP                |
| Request Validation         | Zod schemas on all backend endpoints + Formik/Zod on all frontend forms        |
| NoSQL Injection Prevention | express-mongo-sanitize                                                         |
| XSS Prevention             | Client-side HTML tag stripping via sanitizeInput utility                       |
| HTTP Security Headers      | Helmet.js                                                                      |
| Parameter Pollution        | HPP middleware                                                                 |
| Rate Limiting              | Global (100 requests/15min), Auth routes (10 requests/15min)                   |
| CORS                       | Whitelisted frontend origin with credentials                                   |
| File Access Control        | HMAC-SHA256 signed URLs (local) / S3 pre-signed URLs (AWS)                     |
| Body Size Limit            | 10kb JSON payload limit                                                        |
| Sensitive Field Redaction  | Audit logs strip password, tpin, and totpToken fields                          |
| Transaction Atomicity      | MongoDB sessions with write-conflict retry (5 attempts, exponential backoff)   |
| RBAC                       | Three roles (Customer, Cashier, Manager) enforced on both backend and frontend |
| Frozen Account Enforcement | Automatic redirect + API-level blocking for frozen users                       |
| Error Recovery             | Global process listeners for unhandledRejection and uncaughtException          |

---

## Project Structure

```
portalrupee/
├── backend/                      # Express.js REST API
│   ├── src/
│   │   ├── app.js                # Express configuration and middleware stack
│   │   ├── server.js             # Entry point: DB, Redis, RabbitMQ, Socket.io init
│   │   ├── config/               # Database, Redis, RabbitMQ, S3, Socket.io setup
│   │   ├── controllers/          # 11 controllers (auth, user, account, transaction, etc.)
│   │   ├── models/               # 6 Mongoose models (User, Account, Transaction, etc.)
│   │   ├── routes/               # 11 route files mapped to /api/v1/*
│   │   ├── middleware/           # Auth, RBAC, rate limiting, validation, audit, upload
│   │   ├── validators/           # Zod schemas for all endpoints
│   │   ├── utils/                # JWT, OTP, encryption, mailer, S3, queue helpers
│   │   ├── templates/            # EJS template for PDF bank statements
│   │   └── scripts/              # Database seeder and index maintenance
│   ├── tests/                    # Backend integration test suite
│   ├── .env.example
│   ├── package.json
│   └── README.md                 # Detailed backend documentation
├── frontend/                     # React 19 SPA
│   ├── src/
│   │   ├── main.jsx              # Entry point with Redux and Theme providers
│   │   ├── App.jsx               # Router, lazy loading, error boundary
│   │   ├── api/                  # Axios instance with interceptors
│   │   ├── context/              # SocketContext (real-time) + ThemeContext (dark mode)
│   │   ├── store/                # Redux Toolkit store with 6 domain slices
│   │   ├── layouts/              # PublicLayout (Navbar+Footer), ProtectedLayout (Sidebar+Header)
│   │   ├── components/           # 29 reusable components
│   │   └── pages/                # 22 page components
│   ├── vercel.json               # SPA rewrite rules for Vercel
│   ├── .env.example
│   ├── package.json
│   └── README.md                 # Detailed frontend documentation
├── docs/                         # Project documentation
│   ├── timeline.md               # 35-day implementation timeline
│   ├── deployment-guide.md       # EC2 + Vercel deployment walkthrough
│   ├── aws-s3-setup.md           # AWS S3 bucket configuration guide
│   ├── rabbitmq-docker-setup.md  # RabbitMQ Docker setup guide
│   ├── redis-use.md              # Redis usage documentation
│   ├── implementation.md         # Implementation notes
│   ├── idea.md                   # Original project concept
│   ├── DFD.svg                   # Data Flow Diagram
│   ├── UseCase.svg               # Use Case Diagram
│   └── StateTransition.svg       # State Transition Diagram
├── tests/                        # Playwright E2E test suite
│   └── transaction-engine.spec.ts
├── .github/
│   └── workflows/
│       ├── backend-ci.yml        # CI: lint on push
│       └── backend-deploy.yml    # CD: Docker build + EC2 deploy on main
├── docker-compose.yml            # Backend + Redis + RabbitMQ orchestration
├── playwright.config.ts          # Playwright E2E test configuration
└── package.json                  # Root: E2E test scripts, concurrency tests
```

---

## Getting Started

### Prerequisites

| Dependency | Version | Purpose                                                  |
| ---------- | ------- | -------------------------------------------------------- |
| Node.js    | >= 18.x | JavaScript runtime                                       |
| npm        | >= 9.x  | Package manager                                          |
| MongoDB    | Atlas   | Primary database (replica set required for transactions) |
| Redis      | >= 6.x  | OTP storage with TTL expiration                          |
| RabbitMQ   | >= 3.x  | Message queue (optional, has inline fallbacks)           |
| Docker     | Latest  | Container orchestration for Redis + RabbitMQ             |
| Chromium   | Latest  | Required by Puppeteer for PDF generation                 |

### Clone the Repository

```bash
git clone https://github.com/rishi-tiwari023/portalrupee.git
cd portalrupee
```

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Redis URL, etc.

# Seed the database with test users and accounts
npm run seed

# Start the development server
npm run dev
```

The backend server starts on `http://localhost:5000` and connects to MongoDB, Redis, RabbitMQ, and initializes Socket.io.

See [backend/README.md](backend/README.md) for the full API reference, data models, middleware documentation, and environment variable details.

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_BASE_URL to your backend URL

# Start the development server
npm run dev
```

The frontend dev server starts on `http://localhost:5173` with hot module replacement.

See [frontend/README.md](frontend/README.md) for the complete routing guide, state management details, component catalog, and feature documentation.

### Docker Compose (Infrastructure)

Start Redis and RabbitMQ locally using Docker Compose:

```bash
# From the project root
docker-compose up -d redis rabbitmq
```

This starts:

- **Redis** on port `6379` (with health checks and persistent volume)
- **RabbitMQ** on port `5672` (AMQP) and `15672` (Management UI, credentials: `admin/admin`)

For full production deployment with the backend container:

```bash
docker-compose up -d
```

---

## Deployment

The project uses a split deployment architecture:

### Backend (AWS EC2 via Docker + GitHub Actions)

1. Push to the `main` branch triggers the GitHub Actions CD pipeline
2. The pipeline builds a Docker image of the backend and pushes it to Docker Hub
3. GitHub Actions SSHs into the EC2 instance and runs `docker-compose pull && docker-compose up -d`
4. The backend runs alongside Redis and RabbitMQ containers on the same EC2 instance

**Required GitHub Secrets:** `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`

### Frontend (Vercel)

1. Connect the repository to Vercel
2. Set root directory to `frontend`
3. Add `VITE_API_BASE_URL` environment variable pointing to the backend
4. Deploy

See [docs/deployment-guide.md](docs/deployment-guide.md) for the complete step-by-step deployment walkthrough including EC2 setup, Elastic IP allocation, Docker installation, and CORS configuration.

---

## API Documentation

The backend exposes 50+ RESTful endpoints organized across 12 route groups:

| Route Group     | Base Path              | Endpoints | Description                          |
| --------------- | ---------------------- | --------- | ------------------------------------ |
| Authentication  | `/api/v1/auth`         | 8         | Register, Login, OTP, 2FA, Reset     |
| User Management | `/api/v1/users`        | 5         | Profile CRUD, Search, KYC            |
| TPIN            | `/api/v1/tpin`         | 3         | Set, Change, Reset transaction PIN   |
| Two-Factor Auth | `/api/v1/2fa`          | 3         | Setup QR, Enable, Disable            |
| Accounts        | `/api/v1/accounts`     | 11        | CRUD, Balance, Freeze, Disputes      |
| Transactions    | `/api/v1/transactions` | 7         | Deposit, Withdraw, Transfer, History |
| Dashboard       | `/api/v1/dashboard`    | 2         | Summary, Analytics                   |
| Chat            | `/api/v1/chats`        | 3         | Rooms, Permissions, Messages         |
| File Uploads    | `/api/v1/uploads`      | 3         | Upload, View, Pre-signed URL         |
| Admin Panel     | `/api/v1/admin`        | 5         | Stats, Users, KYC Queue, Roles       |
| Contact         | `/api/v1/contact`      | 1         | Public contact form                  |
| Health          | `/health`              | 1         | Server health check                  |

A **Postman Collection** with pre-filled payloads and automatic JWT handling is available at `docs/PortalRupee.postman_collection.json`.

See [backend/README.md](backend/README.md) for the complete API reference with request/response examples, query parameters, and data model schemas.

---

## Testing

### End-to-End Tests (Playwright)

```bash
# From the project root
npm run test:e2e
```

Playwright tests cover the transaction engine flow and are configured in `playwright.config.ts`.

### Concurrency Tests

```bash
npm run test:concurrency
```

Tests concurrent transaction processing to verify MongoDB write-conflict retry logic.

### Backend Integration Tests

```bash
cd backend
# Individual test files in the tests/ directory cover:
# admin, analytics, chat, concurrency, KYC, notifications,
# OTP, password reset, TPIN reset, role dashboards, S3,
# security, user profile, and welcome email flows
```

---

## Authors

- **Rishi Tiwari** and **Gagan Gupta**

---

## License

This project is licensed under the [MIT License](LICENSE).
