# PortalRupee - Frontend

> Modern, responsive single-page application powering PortalRupee's digital banking experience with role-based dashboards, real-time notifications, and interactive financial tools.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io_Client-4.x-010101?logo=socketdotio&logoColor=white)

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
  - [Running the Dev Server](#running-the-dev-server)
  - [Production Build](#production-build)
- [Routing and Navigation](#routing-and-navigation)
  - [Public Routes](#public-routes)
  - [Protected Routes (Customer)](#protected-routes-customer)
  - [Protected Routes (Cashier)](#protected-routes-cashier)
  - [Protected Routes (Manager)](#protected-routes-manager)
- [State Management (Redux)](#state-management-redux)
- [Pages and Features](#pages-and-features)
  - [Public Pages](#public-pages)
  - [Authentication](#authentication)
  - [Customer Dashboard](#customer-dashboard)
  - [Accounts and Transactions](#accounts-and-transactions)
  - [Peer-to-Peer Transfer](#peer-to-peer-transfer)
  - [Expenditure Analytics](#expenditure-analytics)
  - [Real-time Chat](#real-time-chat)
  - [KYC Document Submission](#kyc-document-submission)
  - [Profile Management](#profile-management)
  - [Settings](#settings)
  - [Account Frozen View](#account-frozen-view)
  - [Cashier Dashboard](#cashier-dashboard)
  - [Manager Dashboard](#manager-dashboard)
- [Components](#components)
- [Real-time Features (Socket.io)](#real-time-features-socketio)
- [Security](#security)
- [Deployment](#deployment)
- [Authors](#authors)

---

## Overview

PortalRupee Frontend is a React 19 single-page application built with Vite and styled with Tailwind CSS 4. It provides a premium banking interface with three distinct role-based experiences:

- **Customer Dashboard** with account management, peer-to-peer transfers, expenditure analytics (Recharts), real-time chat, transaction history with PDF statement downloads, KYC document submission, and TPIN/2FA security setup
- **Cashier Dashboard** with deposit approval workflows for customer-initiated fund requests
- **Manager Dashboard** with user management (search, filter, role changes), KYC approval queue, account freeze/unfreeze controls, freeze dispute resolution, and system-wide oversight
- **Public Pages** including an EMI calculator, RBI guideline summary, "What is PortalRupee" explainer, contact form, terms and conditions, banking guidelines, and interest information

The app uses Redux Toolkit for centralized state management across 6 slices, Socket.io for real-time transaction and message notifications, Formik with Zod for form validation, and Framer Motion for fluid page transitions and micro-animations.

---

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | React 19.x                                    |
| Build Tool       | Vite 7.x                                      |
| Styling          | Tailwind CSS 4.x (class-based dark mode)      |
| State Management | Redux Toolkit 2.x + React-Redux 9.x           |
| Routing          | React Router DOM 7.x                          |
| HTTP Client      | Axios (with request/response interceptors)    |
| Form Handling    | Formik 2.x + Zod 3.x (via zod-formik-adapter) |
| Charts           | Recharts 3.x                                  |
| Real-time        | Socket.io Client 4.x                          |
| Animations       | Framer Motion 12.x, Anime.js 4.x              |
| Icons            | Lucide React, React Icons                     |
| Notifications    | React Toastify 11.x                           |
| Deployment       | Vercel (with SPA rewrites)                    |

---

## Architecture

```
+---------------------+
|    Public Layout     |
|  (Navbar + Footer)   |
+----------+----------+
           |
    +------+------+
    |             |
+---+---+   +----+----+
| Guest |   | Public  |
| Routes|   | Pages   |
| Login |   | About   |
| Signup|   | Contact |
+-------+   | Terms   |
             | etc.    |
             +---------+

+---------------------+
|  Protected Layout    |
| (Sidebar + Header)   |
+----------+----------+
           |
    +------+------+------+
    |             |      |
+---+----+ +-----+--+ +-+-------+
|CUSTOMER| |CASHIER | |MANAGER  |
|Dashboard| |Approve | |Users    |
|Accounts | |Deposits| |Freeze   |
|Transfer | |Profile | |Disputes |
|Messages | |Settings| |Profile  |
|Analytics| +--------+ |Settings |
|KYC      |             +---------+
|Txn Hist.|
+----------+
```

**Data Flow:**

```
React Components
      |
      v
Redux Toolkit (6 Slices)
      |
      v
Axios Instance (withCredentials)
      |
      v
Backend REST API (/api/v1/*)
      |
      +-------> Socket.io (Real-time events)
```

- **Authentication** relies on HTTP-only cookies set by the backend. The Axios instance is configured with `withCredentials: true` to automatically include cookies on every request.
- **Socket.io** connects using the same cookie-based authentication. The SocketContext provider manages the connection lifecycle, listens for transaction and message notifications, and persists the notification list to localStorage.
- **Theme** is managed via a React Context (`ThemeContext`) that toggles between `light`, `dark`, and `system` modes using Tailwind's class-based dark mode strategy.

---

## Project Structure

```
frontend/
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration (class dark mode)
├── postcss.config.js             # PostCSS with Tailwind plugin
├── vercel.json                   # Vercel SPA rewrite rules
├── .env.example                  # Environment variable template
├── package.json
└── src/
    ├── main.jsx                  # App entry: Redux Provider, ThemeProvider, React root
    ├── App.jsx                   # Router definition, lazy loading, error boundary, toasts
    ├── App.css                   # Minimal app-level styles
    ├── index.css                 # Global styles and Tailwind directives
    ├── api/
    │   └── axios.js              # Axios instance with interceptors (401, 429, 5xx handling)
    ├── assets/
    │   └── logo.png              # PortalRupee logo
    ├── context/
    │   ├── SocketContext.jsx      # Socket.io provider (connect, notifications, read state)
    │   └── ThemeContext.jsx       # Theme provider (light/dark/system persistence)
    ├── store/
    │   ├── index.js              # Redux store configuration (6 reducers)
    │   └── slices/
    │       ├── authSlice.js      # Login, Register, Logout, 2FA, OTP, Password Reset, getMe
    │       ├── dashboardSlice.js  # Dashboard summary (balances, recent activity)
    │       ├── accountSlice.js    # Account CRUD, balance check, create account
    │       ├── transactionSlice.js# Deposit, Withdraw, Transfer, History, PDF Statement
    │       ├── analyticsSlice.js  # Expenditure analytics (spending trends, categories)
    │       └── adminSlice.js      # System stats, user listing, KYC queue, role management
    ├── layouts/
    │   ├── PublicLayout.jsx       # Navbar + Footer wrapper for public routes
    │   └── ProtectedLayout.jsx   # Sidebar + Header + notifications for authenticated routes
    ├── components/
    │   ├── Navbar.jsx             # Public navigation bar with dropdowns and notifications
    │   ├── Sidebar.jsx            # Role-aware collapsible sidebar with navigation links
    │   ├── Footer.jsx             # Copyright footer
    │   ├── RoleBasedRoute.jsx     # RBAC route guard (redirects unauthorized roles)
    │   ├── GuestRoute.jsx         # Redirects authenticated users away from login/register
    │   ├── ErrorBoundary.jsx      # React error boundary with fallback UI
    │   ├── AccountSummaryCard.jsx # Individual account card (balance, type, status)
    │   ├── BalanceCheckModal.jsx  # Secure balance check modal (TOTP if 2FA enabled)
    │   ├── CreateAccountModal.jsx # New account creation modal (Savings/Current)
    │   ├── DepositModal.jsx       # Deposit funds modal with account selector
    │   ├── WithdrawModal.jsx      # Withdraw funds modal with balance validation
    │   ├── DownloadStatementModal.jsx # PDF statement download with date range picker
    │   ├── TransactionDetailsModal.jsx# Transaction detail view (sender, receiver, status)
    │   ├── TransactionTable.jsx   # Paginated transaction table with status badges
    │   ├── TransactionFilters.jsx # Filter bar (type, status, date range, amount range)
    │   ├── Pagination.jsx         # Reusable pagination component
    │   ├── TPINSetupWizard.jsx    # Multi-step TPIN setup wizard
    │   ├── TPINInput.jsx          # Masked 6-digit TPIN input component
    │   ├── TPINRecoveryModal.jsx  # TPIN reset via OTP verification flow
    │   ├── TwoFactorSetup.jsx     # 2FA setup (QR code display, TOTP verification)
    │   ├── TOTPVerifyModal.jsx    # TOTP verification modal for sensitive operations
    │   ├── OTPInput.jsx           # 6-digit OTP input with auto-focus and resend timer
    │   ├── FileUpload.jsx         # Drag-and-drop file upload with progress bar
    │   ├── EMICalculator.jsx      # Interactive EMI calculator (principal, rate, tenure)
    │   └── RBIGuideline.jsx       # RBI regulatory guideline summary
    └── pages/
        ├── Home.jsx               # Landing page (logo, EMI calculator, RBI guidelines)
        ├── Login.jsx              # Login with 2FA flow, forgot password, disable 2FA via OTP
        ├── Register.jsx           # User registration with Zod validation
        ├── About.jsx              # "What is PortalRupee" explainer page
        ├── ContactUs.jsx          # Contact form (name, email, subject, message)
        ├── Terms.jsx              # Terms and conditions page
        ├── Guidelines.jsx         # Banking guidelines page
        ├── InterestInfo.jsx       # Interest rates information page
        ├── DashboardHome.jsx      # Customer dashboard (balance card, quick actions, recent txns)
        ├── Profile.jsx            # User profile view/edit, profile image upload, last login
        ├── Settings.jsx           # Theme preference (light/dark/system)
        ├── Accounts.jsx           # Account listing with deposit, withdraw, balance check, KYC status
        ├── Transfer.jsx           # P2P transfer flow (search user, amount, TPIN, confirmation)
        ├── Transactions.jsx       # Transaction history with filters, search, and pagination
        ├── Analytics.jsx          # Expenditure analytics (spending trends, category breakdown, charts)
        ├── Messages.jsx           # Real-time chat (room list, message bubbles, typing indicators)
        ├── KYC.jsx                # KYC document submission (ID proof + signature upload)
        ├── AccountFrozen.jsx      # Frozen account status page with dispute submission
        ├── ApproveDeposits.jsx    # Cashier: pending deposit approval/rejection queue
        ├── Users.jsx              # Manager: user listing, search, role change, KYC approval
        ├── FreezeAccounts.jsx     # Manager: account freeze/unfreeze management
        └── FreezeDisputes.jsx     # Manager: freeze dispute review
```

---

## Getting Started

### Prerequisites

| Dependency | Version | Purpose                          |
| ---------- | ------- | -------------------------------- |
| Node.js    | >= 18.x | JavaScript runtime               |
| npm        | >= 9.x  | Package manager                  |
| Backend    | Running | PortalRupee backend API required |

### Installation

```bash
# Navigate to the frontend directory
cd portalrupee/frontend

# Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable            | Required | Description                                                 |
| ------------------- | -------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL` | **Yes**  | Backend API base URL (e.g., `http://localhost:5000/api/v1`) |

### Running the Dev Server

```bash
npm run dev
```

The development server will start on `http://localhost:5173` with hot module replacement (HMR) enabled.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The production build outputs to the `dist/` directory and can be deployed to any static hosting provider.

---

## Routing and Navigation

All routes use React Router DOM v7 with lazy-loaded page components wrapped in `Suspense` for code splitting.

### Public Routes

| Path             | Page         | Auth Required | Description                          |
| ---------------- | ------------ | ------------- | ------------------------------------ |
| `/`              | Home         | No            | Landing page with EMI calculator     |
| `/login`         | Login        | Guest only    | Login with 2FA and password recovery |
| `/register`      | Register     | Guest only    | User registration                    |
| `/about`         | About        | No            | "What is PortalRupee" explainer      |
| `/contact`       | ContactUs    | No            | Contact form submission              |
| `/terms`         | Terms        | No            | Terms and conditions                 |
| `/guidelines`    | Guidelines   | No            | Banking guidelines                   |
| `/interest-info` | InterestInfo | No            | Interest rates information           |

> Guest routes (`/login`, `/register`) automatically redirect authenticated users to `/dashboard`.

### Protected Routes (Customer)

| Path                      | Page          | Description                                  |
| ------------------------- | ------------- | -------------------------------------------- |
| `/dashboard`              | DashboardHome | Balance overview, quick actions, recent txns |
| `/dashboard/profile`      | Profile       | View/edit profile, upload profile image      |
| `/dashboard/settings`     | Settings      | Theme preferences                            |
| `/dashboard/accounts`     | Accounts      | Account listing, deposit, withdraw, balance  |
| `/dashboard/transfer`     | Transfer      | P2P money transfer with TPIN verification    |
| `/dashboard/transactions` | Transactions  | Filtered, paginated transaction history      |
| `/dashboard/analytics`    | Analytics     | Spending trends, category breakdown, charts  |
| `/dashboard/messages`     | Messages      | Real-time chat with transacting users        |
| `/dashboard/kyc`          | KYC           | Upload KYC documents (ID + signature)        |
| `/dashboard/frozen`       | AccountFrozen | Frozen account status and dispute form       |

> Completely frozen users are automatically redirected to `/dashboard/frozen` and cannot access other pages except Profile and Settings.

### Protected Routes (Cashier)

| Path                          | Page            | Description                        |
| ----------------------------- | --------------- | ---------------------------------- |
| `/dashboard/profile`          | Profile         | View/edit profile                  |
| `/dashboard/approve-deposits` | ApproveDeposits | Approve or reject pending deposits |
| `/dashboard/settings`         | Settings        | Theme preferences                  |

> Cashiers are auto-redirected to the Approve Deposits page on login.

### Protected Routes (Manager)

| Path                         | Page           | Description                       |
| ---------------------------- | -------------- | --------------------------------- |
| `/dashboard/profile`         | Profile        | View/edit profile                 |
| `/dashboard/users`           | Users          | User listing, search, KYC, roles  |
| `/dashboard/freeze-accounts` | FreezeAccounts | Freeze/unfreeze user accounts     |
| `/dashboard/freeze-disputes` | FreezeDisputes | Review freeze disputes from users |
| `/dashboard/settings`        | Settings       | Theme preferences                 |

> Managers are auto-redirected to the User Management page on login.

---

## State Management (Redux)

The Redux store is configured with 6 slices, each managing a distinct domain:

| Slice         | Key State                               | Async Thunks                                                                                                                 |
| ------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `auth`        | `user`, `isAuthenticated`, `loading`    | `loginUser`, `registerUser`, `logoutUser`, `getMe`, `verify2FA`, `sendOTP`, `verifyOTP`, `resetPassword`, `disable2FAViaOTP` |
| `dashboard`   | `summary`, `loading`                    | `fetchDashboardSummary`                                                                                                      |
| `account`     | `accounts`, `loading`                   | `fetchAccounts`, `createAccount`, `checkBalance`                                                                             |
| `transaction` | `transactions`, `pagination`, `loading` | `fetchTransactions`, `deposit`, `withdraw`, `transfer`                                                                       |
| `analytics`   | `data`, `loading`                       | `fetchAnalytics`                                                                                                             |
| `admin`       | `stats`, `users`, `kycQueue`, `loading` | `fetchStats`, `fetchUsers`, `fetchKYCQueue`, `updateKYCStatus`, `updateRole`                                                 |

All async thunks use `createAsyncThunk` with the shared Axios instance, which handles cookie-based JWT authentication automatically.

---

## Pages and Features

### Public Pages

- **Home** - Landing page featuring the PortalRupee logo, a welcome message, an interactive EMI (Equated Monthly Installment) calculator, and an RBI guideline summary card
- **About** - Comprehensive "What is PortalRupee" explainer page describing the platform's features and purpose
- **Contact Us** - Contact form with name, email, subject, and message fields (validated with Zod, submitted to the backend, which emails the admin)
- **Terms** - Terms and conditions page
- **Guidelines** - Banking guidelines and best practices
- **Interest Info** - Interest rates information page for savings and current accounts

### Authentication

- **Login** - Email and password sign-in with Formik/Zod validation. Supports:
  - TOTP-based 2FA verification step (6-digit code from authenticator app)
  - Forgot password recovery (Send OTP to email, Verify OTP, Reset password) with a step-by-step progress indicator
  - Disable 2FA via OTP for users who lost access to their authenticator device
  - Frozen account detection (redirects to frozen page on login)
- **Register** - Multi-field registration form (first name, last name, email, mobile, password) with real-time Zod validation and password strength indicators

### Customer Dashboard

- **Balance Card** - Premium dark gradient card showing total available balance across all accounts, partial account number, and active account count
- **Quick Actions** - Four action buttons: Add Funds (deposit modal), Withdraw (withdraw modal), Send Money (navigates to transfer page), Statements
- **Savings Goal** - Visual savings goal tracker with progress bar and ETA
- **My Accounts** - Grid of AccountSummaryCards showing individual account balances, types, and statuses
- **Recent Transactions** - List of latest transactions with credit/debit indicators, amounts, timestamps, and status badges. Clicking a transaction opens a detailed modal

### Accounts and Transactions

- **Account Management** - Create Savings or Current accounts, view account details, check balance (with TOTP verification if 2FA is enabled), and see KYC verification status
- **Deposit Modal** - Select account, enter amount and description, submit deposit request (goes to PENDING status for customer deposits, requires cashier/manager approval)
- **Withdraw Modal** - Select account, enter amount with real-time balance validation
- **Transaction History** - Paginated table with filters for transaction type (Deposit/Withdraw/Transfer), status (Pending/Success/Failed), date range, and amount range. Includes a search bar for transaction IDs
- **Download Statement** - Modal with date range picker that triggers PDF generation and download of a formatted bank statement
- **Transaction Details** - Modal showing full transaction information including sender, receiver, amount, type, status, and timestamp

### Peer-to-Peer Transfer

- **User Search** - Search for recipients by name, email, mobile, or account number
- **Transfer Flow** - Multi-step process: select recipient, enter amount with description, verify TPIN (masked 6-digit input), confirm and submit
- **TPIN Setup** - Multi-step wizard for first-time TPIN configuration
- **TPIN Recovery** - Reset TPIN via OTP email verification flow

### Expenditure Analytics

- **Spending Trends** - Line/bar charts showing daily or monthly spending patterns over configurable time ranges (7 days, 30 days, 12 months, custom)
- **Category Breakdown** - Pie chart showing auto-categorized expenses (Food and Dining, Utilities, Shopping, Travel, Investment, Transfer Out, Cash Withdrawal, Other)
- **Summary Cards** - Total spent, percentage change vs previous period, average transaction size, max transaction
- **Inflow vs Outflow** - Net savings visualization comparing incoming and outgoing funds
- All charts are rendered with Recharts and support time range filtering

### Real-time Chat

- **Permission-based Rooms** - Messaging is allowed only between users who have completed at least one transfer transaction with each other
- **Chat Room List** - Sidebar showing available chat contacts sorted by most recent activity
- **Message Interface** - Chat bubble UI with timestamps, scroll management, and visual sender/receiver distinction
- **Typing Indicators** - Real-time "user is typing..." indicators via Socket.io events
- **Message Notifications** - Toast notifications for incoming messages (suppressed when already on the Messages page)

### KYC Document Submission

- **Document Upload** - Drag-and-drop file upload component with progress bar for ID proof and signature
- **Image Preview** - Preview uploaded documents before submission
- **Status Tracking** - Visual KYC status indicator (Not Started, Pending, Verified, Rejected)

### Profile Management

- **View/Edit Profile** - Update first name, last name, email, and mobile number
- **Profile Image** - Upload profile photo (stored in AWS S3), displayed in the navbar avatar and sidebar
- **Last Login** - Displays the user's last login timestamp
- **2FA Setup** - Enable/disable Two-Factor Authentication with QR code scanning for authenticator apps
- **TPIN Management** - Set, change, or reset transaction PIN

### Settings

- **Theme Selector** - Choose between Light, Dark, or System Default appearance. Persisted to localStorage and applied via Tailwind's class-based dark mode

### Account Frozen View

- **Freeze Status** - Displays frozen account status with clear visual indicators
- **Dispute Submission** - Allows customers to submit a dispute message explaining why their account should be unfrozen

### Cashier Dashboard

- **Approve Deposits** - Queue of pending customer deposit requests with approve/reject actions. Shows depositor details, amount, and submission timestamp

### Manager Dashboard

- **User Management** - Paginated, searchable user listing with filters by role and KYC status. Includes inline role change and KYC approval/rejection actions
- **Freeze Accounts** - Browse all system accounts, freeze or unfreeze individual accounts with confirmation
- **Freeze Disputes** - Review dispute messages submitted by frozen account holders

---

## Components

| Component                 | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `Navbar`                  | Public navigation with links, notification bell, user dropdown |
| `Sidebar`                 | Role-aware collapsible sidebar with animated navigation links  |
| `Footer`                  | Simple copyright footer                                        |
| `ProtectedLayout`         | Auth guard + sidebar + header + notification panel             |
| `PublicLayout`            | Navbar + main content + footer wrapper                         |
| `RoleBasedRoute`          | RBAC route guard (checks user role against allowed roles)      |
| `GuestRoute`              | Redirects authenticated users to dashboard                     |
| `ErrorBoundary`           | React error boundary with user-friendly fallback UI            |
| `AccountSummaryCard`      | Account card with balance, type badge, and status indicator    |
| `BalanceCheckModal`       | Balance inquiry with optional TOTP verification                |
| `CreateAccountModal`      | Savings/Current account creation form                          |
| `DepositModal`            | Deposit form with account selector and TOTP support            |
| `WithdrawModal`           | Withdrawal form with real-time balance validation              |
| `DownloadStatementModal`  | PDF statement download with date range selection               |
| `TransactionDetailsModal` | Full transaction detail view                                   |
| `TransactionTable`        | Paginated table with status badges and amount formatting       |
| `TransactionFilters`      | Filter controls for transaction type, status, dates, amounts   |
| `Pagination`              | Reusable pagination with page numbers and navigation           |
| `TPINSetupWizard`         | Multi-step TPIN configuration wizard                           |
| `TPINInput`               | Masked 6-digit input for TPIN entry                            |
| `TPINRecoveryModal`       | TPIN reset flow via OTP email verification                     |
| `TwoFactorSetup`          | 2FA QR code display and TOTP verification                      |
| `TOTPVerifyModal`         | TOTP verification modal for sensitive operations               |
| `OTPInput`                | 6-digit OTP input with auto-focus and countdown resend timer   |
| `FileUpload`              | Drag-and-drop file upload with progress indicator              |
| `EMICalculator`           | Interactive loan EMI calculator (principal, rate, tenure)      |
| `RBIGuideline`            | RBI regulatory guideline summary card                          |

---

## Real-time Features (Socket.io)

The `SocketContext` provider manages WebSocket connectivity:

- **Auto-connect** when the user is authenticated (disconnects on logout)
- **Cookie-based auth** using `withCredentials: true` (JWT from HTTP-only cookie)
- **Reconnection** with up to 5 attempts and 1-second delay between retries
- **Connection status** displayed as an Online/Offline indicator in the dashboard header

### Listened Events

| Event                          | Action                                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| `new_transaction_notification` | Adds to notification list, shows toast, persists to localStorage     |
| `new_message_notification`     | Adds to notification list, shows toast (suppressed on Messages page) |
| `receive_message`              | Renders new message in active chat room                              |
| `typing` / `stop_typing`       | Shows/hides typing indicator in chat                                 |

### Emitted Events

| Event          | Payload                     | Purpose                    |
| -------------- | --------------------------- | -------------------------- |
| `join_chat`    | `{ targetUserId }`          | Join a chat room           |
| `send_message` | `{ targetUserId, content }` | Send a message             |
| `typing`       | `{ roomId }`                | Broadcast typing indicator |
| `stop_typing`  | `{ roomId }`                | Clear typing indicator     |

### Notification System

- Notifications are stored in React state and synced to `localStorage` under the key `portalrupee_notifications`
- Each notification includes: `id`, `type`, `subType`, `amount`, `message`, `createdAt`, `read`
- The notification bell in the header shows an unread count badge
- Clicking a notification navigates to the relevant page (Transactions or Messages) and marks it as read
- "Mark all as read" and clear all actions are available in the dropdown

---

## Security

| Feature                  | Implementation                                                   |
| ------------------------ | ---------------------------------------------------------------- |
| Authentication           | HTTP-only cookies (JWT set by backend, no token in localStorage) |
| Input Sanitization       | HTML tag stripping via `sanitizeInput()` utility on user inputs  |
| Form Validation          | Zod schemas with Formik integration on all forms                 |
| Route Protection         | `ProtectedLayout` redirects unauthenticated users to `/login`    |
| RBAC                     | `RoleBasedRoute` checks user role against allowed roles list     |
| Guest Route Guard        | `GuestRoute` prevents authenticated users from accessing login   |
| Error Boundary           | React ErrorBoundary catches render errors with fallback UI       |
| Network Error Handling   | Axios interceptors handle 401, 429, 5xx, and network errors      |
| Frozen Account Handling  | Automatic redirect for completely frozen users                   |
| 2FA Prompt               | Session-based prompt encouraging users to enable 2FA             |
| Online/Offline Detection | Browser online/offline events trigger toast notifications        |

---

## Deployment

The frontend is deployed on **Vercel** with SPA rewrite rules configured in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Vercel Setup:**

1. Import the `portalrupee` repository on Vercel
2. Set the root directory to `frontend`
3. Add the environment variable:
   - `VITE_API_BASE_URL` = your backend API URL (e.g., `http://35.154.77.142:5000/api/v1`)
4. Deploy

**Live URL:** `https://portalrupee.vercel.app`

---

## Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start Vite development server with HMR |
| `npm run build`   | Build production bundle to `dist/`     |
| `npm run preview` | Preview production build locally       |
| `npm run lint`    | Run ESLint                             |

---

## Authors

- **Rishi Tiwari** and **Gagan Gupta**
