# PortalRupee - Project Concept

## Overview

PortalRupee is a full-stack digital banking platform built as a project, simulating a real-world banking environment with three user roles (Customer, Cashier, Manager), atomic financial transactions, real-time communication, and event-driven architecture.

## Implemented Features

### 1. Authentication and Authorization

- JWT-based authentication with HTTP-only secure cookies (access + refresh tokens)
- Role-based access control (RBAC) with three roles: Customer, Cashier, Manager
- Password hashing with bcrypt (12 salt rounds)
- TOTP-based Two-Factor Authentication via Speakeasy and authenticator apps (Google Authenticator, Authy)
- OTP email verification with Redis TTL storage for password reset, TPIN reset, and 2FA disable flows
- 6-digit Transaction PIN (TPIN) with bcrypt hashing for securing peer-to-peer transfers
- Forgot Password recovery flow with step-by-step progress indicator (Send OTP, Verify, Reset, Success)
- Disable 2FA via email OTP for users who lost access to their authenticator device

### 2. User Management

- **Roles**: Customer, Cashier, Manager with distinct dashboards and sidebar navigation
- **User Profile**:
  - First name and last name
  - Email address (unique)
  - Mobile number (unique)
  - Profile image (uploaded to AWS S3, displayed in navbar avatar)
  - KYC document upload (ID proof + signature via S3)
  - KYC status tracking (Not Started, Pending, Verified, Rejected)
  - Last login timestamp
  - 2FA enabled/disabled status
  - TPIN set/not set status
- **User Search**: Search by name, email, mobile, or account number for transfer recipient discovery

### 3. Account Management

- Account types: Savings and Current (one of each per user)
- 12-digit unique account numbers (auto-generated)
- Account creation via modal interface
- Balance inquiry with optional TOTP verification (when 2FA is enabled)
- Account status management: Active, Blocked, Closed
- Account freeze/unfreeze by Manager role
- Freeze dispute submission by customers
- Accounts cannot be closed if balance is greater than zero

### 4. Transaction Features

- **Deposit**: Customer deposits go to Pending status and require Cashier/Manager approval. Cashier/Manager deposits are processed immediately
- **Withdrawal**: Account owner or Manager can withdraw with real-time balance validation
- **Peer-to-Peer Transfer**: Atomic debit-credit within a single MongoDB transaction with TPIN verification
- **Atomicity**: All financial operations use MongoDB sessions with write-conflict retry logic (up to 5 attempts with exponential backoff)
- **Transaction History**: Paginated table with filters for type (Deposit/Withdraw/Transfer), status (Pending/Success/Failed), date range, and amount range. Includes search by transaction ID or description
- **PDF Bank Statements**: Downloadable PDF rendered from EJS template via Puppeteer with date range filtering
- **Real-time Notifications**: Both sender and receiver receive Socket.io notifications via RabbitMQ for transfers

### 5. Expenditure Analytics

- MongoDB aggregation pipelines for spending pattern analysis
- Spending trend charts (daily or monthly totals with zero-filled gaps) via Recharts
- Auto-categorized expense breakdown: Food and Dining, Utilities and Bills, Shopping, Travel and Transport, Investment and Savings, Transfer Out, Cash Withdrawal, Other
- Category detection using regex matching against transaction descriptions
- Summary cards: total spent, percentage change vs previous period, average transaction size, max transaction
- Inflow vs outflow comparison with net savings calculation
- Configurable time ranges: 7 days, 30 days, 12 months, or custom date range

### 6. Chat and Messaging

- Real-time chat via Socket.io with JWT cookie authentication
- Permission-based messaging: allowed only between users who have completed at least one transfer transaction
- Chat rooms with deterministic IDs based on sorted user IDs
- Message persistence in MongoDB via RabbitMQ queue
- Typing indicators (typing/stop_typing events)
- Unread message notifications with toast alerts (suppressed when already on the Messages page)
- Chat room list sorted by most recent activity

### 7. Live Notification System

- Real-time transaction notifications via Socket.io (deposit, withdrawal, transfer alerts)
- Real-time message notifications for incoming chat messages
- Notification bell with unread count badge in the dashboard header
- Notification dropdown with mark as read, mark all as read, and navigation to relevant pages
- Notifications persisted to localStorage for cross-session persistence

### 8. KYC (Know Your Customer)

- Drag-and-drop file upload component with progress bar
- Upload ID proof and signature documents (stored in AWS S3 or local filesystem fallback)
- Image preview before submission
- KYC status tracking: Not Started, Pending, Verified, Rejected
- Manager approval queue with FIFO ordering
- Pre-signed URLs for secure document viewing (15-minute expiry)

### 9. Security

- Password and TPIN hashing with bcrypt (12 salt rounds)
- TOTP secrets encrypted at rest with AES-256-CBC
- HTTP-only, Secure (production), SameSite cookies for JWT
- Request validation with Zod schemas on all endpoints
- NoSQL injection prevention via express-mongo-sanitize
- Client-side HTML tag stripping for XSS prevention
- HTTP security headers via Helmet.js
- HTTP Parameter Pollution protection via HPP
- Rate limiting: Global (100 requests/15min), Auth routes (10 requests/15min)
- CORS with whitelisted frontend origin and credentials
- File access control via HMAC-SHA256 signed URLs (local) or S3 pre-signed URLs
- 10kb JSON body size limit
- Sensitive field redaction in audit logs (password, tpin, totpToken stripped)
- Comprehensive audit logging tracking every mutation with actor, action, resource, IP, and user-agent
- Error recovery with global process listeners for unhandledRejection and uncaughtException

### 10. Role-Specific Dashboards

- **Customer Dashboard**: Balance card, quick actions (Add Funds, Withdraw, Send Money, Statements), savings goal tracker, account overview grid, recent transaction feed
- **Cashier Dashboard**: Pending deposit approval queue with approve/reject actions, profile, and settings
- **Manager Dashboard**: User management with search/filter/role changes, KYC approval queue, account freeze/unfreeze controls, freeze dispute review, profile, and settings

### 11. Public Pages

- Landing page with EMI (Equated Monthly Installment) calculator and RBI guideline summary
- "What is PortalRupee" explainer page
- Contact Us form (validated, saved to MongoDB, admin notified via email)
- Terms and Conditions page
- Banking Guidelines page
- Interest Information page

## Architecture

### Database (MongoDB Atlas)

- **Users Collection**: Roles, profile info, KYC documents (S3 keys), 2FA secrets (AES-256 encrypted), TPIN (bcrypt hashed), profile image (S3 key), last login
- **Accounts Collection**: Savings/Current types, 12-digit account numbers, balance, status (Active/Blocked/Closed), freeze dispute messages
- **Transactions Collection**: Deposit/Withdraw/Transfer types, Pending/Success/Failed status, sender/receiver references, auto-generated transaction IDs (TXN-XXXXXXXX)
- **Messages Collection**: Sender, receiver, deterministic room ID, content, read receipts
- **AuditLog Collection**: Actor, action, resource, resource ID, request details (sanitized), IP address, user-agent, success/failure status
- **Contact Collection**: Name, email, subject, message, status (New/Read/Resolved)

OTPs are stored in **Redis** with TTL expiration (not in MongoDB).

### Event-Driven Architecture (RabbitMQ)

Four durable message queues with persistent messages and in-process consumer workers:

| Queue                      | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `queue:transaction_alerts` | Real-time transaction notifications via Socket.io |
| `queue:chat_messages`      | Chat message persistence + Socket.io emission     |
| `queue:emails`             | OTP and Welcome email dispatch via Resend.io      |
| `queue:audit_logs`         | Asynchronous audit log persistence to MongoDB     |

All queues include graceful fallbacks. If RabbitMQ is unavailable, processing happens inline (direct DB writes + Socket.io emissions).

### API Architecture

- RESTful API design with `/api/v1/` versioning
- 50+ endpoints across 12 route groups (auth, users, tpin, 2fa, accounts, transactions, dashboard, chats, uploads, admin, contact, health)
- Rate limiting: Global (100/15min per IP), Auth routes (10/15min per IP)
- Request validation with Zod schemas on all endpoints (body + query params)
- Audit logging middleware on all mutating routes

### Deployment Architecture

- **Backend**: AWS EC2 (t3.medium, Ubuntu 26.04) via Docker Compose (Node.js + Redis + RabbitMQ containers)
- **Frontend**: Vercel (SPA with rewrite rules)
- **CI/CD**: GitHub Actions for Docker build + EC2 deploy on push to main
- **Database**: MongoDB Atlas (replica set for transaction atomicity)
- **File Storage**: AWS S3 with local filesystem fallback

## Authors

- **Rishi Tiwari** and **Gagan Gupta**
