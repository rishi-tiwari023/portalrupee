# PortalRupee - 30-Day Implementation Timeline

**Project Start**: April 8, 2026  
**Project Resumption**: May 23, 2026  
**Project Completion**: June 20, 2026  
**Team**: [Rishi Tiwari](https://github.com/rishi-tiwari023/) and [Gagan Gupta](https://github.com/gagangupta5)

---

## Phase 1: Foundation & Authentication (Week 1)

**Day 01 (Apr 08): Project Setup & Infrastructure**

- **Backend**:
  - Initialize Express.js with JavaScript/Mongoose.
  - Configure `.env` management and Global Error Handler.
  - Setup MongoDB Atlas connection logic.
  - Draft initial GitHub Actions workflow for CI.
- **Frontend**:
  - Initialize Vite + React project.
  - Setup Tailwind CSS integration.
  - Implement Navbar, EMI Calculator, RBI Guidelines, and Footer.
  - Initialize Redux Toolkit (Store, Provider).
  - Configure Axios instance with interceptors for JWT.

**Day 02 (Apr 09): Models & Core UI**

- **Backend**:
  - Define User Schema (Roles: CUSTOMER, CASHIER, MANAGER).
  - Implement Account Schema (Savings/Current types).
  - Setup Zod validation middleware for request bodies.
- **Frontend**:
  - Setup React Router with basic public/protected route shells.
  - Design Sidebar component.
  - Configure UI Theme (Colors, Typography).

**Day 03 (Apr 10): Authentication Logic**

- **Backend**:
  - Implement Sign-up/Login logic with bcrypt hashing.
  - Setup JWT generation (Access + Refresh tokens).
  - Implement `isAuth` and `checkRole` middlewares.
- **Frontend**:
  - Build Login and Registration pages (Formik/Zod).
  - Implement Redux 'auth' slice (Login/Logout/Register actions).
  - Add persistence for JWT in LocalStorage/Cookies.

**Day 04 (Apr 11): RBAC & User Management**

- **Backend**:
  - Profile CRUD endpoints (Get self, Update profile).
  - Admin endpoints for Role Management.
  - Implement Search User (by Email/Mobile) for transfers.
- **Frontend**:
  - Protect routes using RBAC (Higher Order Components).
  - Add loading states and toast notifications (react-toastify).
  - Build User Profile view.

**Day 05 (Apr 12): Redis & Performance**

- **Backend**:
  - Integrate Redis for caching user sessions/OTP.
  - Setup Rate Limiting middleware (express-rate-limit).
- **Frontend**:
  - Build User Profile edit form.
  - Implement basic Error Boundary for the app.

**Day 06 (Apr 13): Seeding & Dashboard**

- **Backend**:
  - Create seed scripts for roles and dummy users.
  - Develop Dashboard summary API (Balance, Recent activity).
- **Frontend**:
  - Build Dashboard Layout with placeholder cards.
  - Integrate Sidebar navigation logic.

**Day 07 (Apr 14): Review & Phase 1 Wrap**

- **Both**: Comprehensive manual testing of Auth flow. Fix any bugs in RBAC or Token management.

---

## Phase 2: Banking Core - Accounts & Transactions (Week 2)

**Day 08 (Apr 15): Account Management**

- **Backend**:
  - Implement Account CRUD (Create, Read account details).
  - Develop Balance Fetching logic with Mongoose `findOne`.
  - Setup initial Account Status (ACTIVE, BLOCKED) logic.
- **Frontend**:
  - Build Account Summary card for Dashboard.
  - Create UI for viewing multiple accounts.
  - Add "Check Balance" modal/interaction.

**Day 09 (Apr 16): TPIN Security**

- **Backend**:
  - Add `tpin` field to User/Account model with bcrypt hashing.
  - Implement `verifyTPIN` helper middleware.
  - Create endpoints for Setting and Changing TPIN.
- **Frontend**:
  - Design TPIN Setup wizard (Multi-step form).
  - Implement secure TPIN input (using masked fields).
  - Add "Forgot TPIN" placeholder link.

**Day 10 (Apr 17): Atomic Transactions (Deposit/Withdraw)**

- **Backend**:
  - Implement Mongoose Transactions (Sessions) for Deposit/Withdraw.
  - Create Transaction schema (Type: DEPOSIT, WITHDRAW, TRANSFER).
  - Implement input validation for amounts (non-negative).
- **Frontend**:
  - Build Deposit and Withdraw forms.
  - Implement real-time balance validation on client-side.
  - Add success/error handling for transaction requests.

**Day 11 (Apr 18): Peer-to-Peer Transfers**

- **Backend**:
  - Develop Search User API (by mobile/email).
  - Implement Atomic Transfer logic (Source Debit -> Destination Credit).
  - Ensure atomicity and error rollback on failure.
- **Frontend**:
  - Build Transfer Flow: Search -> Amount -> TPIN -> Confirmation.
  - Implement "Recent Contacts" or "Frequent Payees" UI logic.

**Day 12 (Apr 19): Transaction History**

- **Backend**:
  - Create paginated Transaction History API.
  - Implement filters (Date range, Transaction type, Status).
  - Add search by transaction ID or counter-party.
- **Frontend**:
  - Build Paginated Table for Transaction History.
  - Implement filter sidebar or dropdowns.
  - Add "Export as CSV" button (UI only).

**Day 13 (Apr 20): Audit Logs**

- **Backend**:
  - Implement Audit Log middleware to track every modification.
  - Create Audit Log schema (Actor, Action, Resource, Timestamp).
- **Frontend**:
  - Build sleek Transaction Details modal/page.
  - Add visual cues for transaction status (Pending, Success, Failed).

**Day 14 (Apr 21): Transaction Engine Review & Integration Testing**

- Review core transaction logic (Deposit, Withdraw, Transfer)
- Implement automated E2E tests with Playwright
- Fix concurrency "Write Conflict" issues with retry logic
- Refine success animations and UI feedbacks.

---

## Academic Hiatus & Project Resumption

> [!NOTE]
> **Academic Hiatus (April 22, 2026 – May 22, 2026)**  
> Following the successful completion of Phase 2, the project was temporarily paused to prioritize semester-end academic commitments. During this intermission, focus was fully directed toward preparing for and completing pre-university and final university examinations. With academic obligations successfully fulfilled, project development resumes on May 23, 2026, starting with Phase 3 (Day 15).

---

## Phase 3: Security, OTP & S3 Storage (Week 3)

**Day 15 (May 23): OTP Service (Nodemailer)**

- **Backend**:
  - Integrate Nodemailer with SMTP transporter.
  - Implement OTP generation and storage in Redis with TTL.
  - Create Send-OTP and Verify-OTP endpoints.
- **Frontend**:
  - Build 6-digit OTP Input component with auto-focus/timer.
  - Implement "Resend OTP" logic with cooldown.

**Day 16 (May 24): S3 Integration**

- **Backend**:
  - Setup AWS SDK for S3 or compatible storage.
  - Create File Upload helper with unique naming (UUID).
  - Implement pre-signed URL logic for secure viewing.
- **Frontend**:
  - Create reusable File Upload component with progress bar.
  - Integrate Drag-and-Drop functionality.

**Day 17 (May 25): Document Uploads (KYC)**

- **Backend**:
  - Update User model to store S3 keys for KYC docs.
  - Implement API to upload Identification and Signature.
- **Frontend**:
  - Build KYC Submission page with mandatory upload fields.
  - Add image preview for uploaded documents.

**Day 18 (May 26): Account Recovery**

- **Backend**:
  - Implement Password Reset flow via OTP.
  - Create TPIN Reset flow (OTP verified).
- **Frontend**:
  - Build "Forgot Password" and "Forgot TPIN" recovery forms.
  - Add step-by-step progress indicator for recovery.

**Day 19 (May 27): Production Mailer (Resend.io)**

- **Backend**:
  - Switch Nodemailer transport to Resend.io for production.
  - Implement HTML email templates for OTP and Welcome emails.
- **Frontend**:
  - Add global Top-level Toast notifications for system alerts.

**Day 20 (May 28): Security Hardening**

- **Backend**:
  - Implement Helmet.js and HPP protection.
  - Review Zod schemas for all sensitive fields.
- **Frontend**:
  - Sanitize all user inputs before rendering.
  - Implement client-side security checks.

---

## Placement & Practical Examinations Hiatus

> [!NOTE]
> **Placement & Practical Examinations Hiatus (May 29, 2026 – June 5, 2026)**  
> Following the completion of Phase 3, development was temporarily paused to focus on university practical examinations and participate in two campus placement drives. Additionally, an university exam retake was required on June 5th due to a paper leak. With these crucial academic and career milestones successfully addressed, project development resumes on June 6, 2026, starting with Phase 4.

---

## Phase 4: Messaging & Real-time Integration (Week 4)

**Day 21 (Jun 06): Review & Bug Fixes**

- **Both**: Security audit (Check for common vulnerabilities). Test OTP delivery speed.

**Day 22 (Jun 07): Socket.io Setup**

- **Backend**:
  - Initialize Socket.io server with Express.
  - Implement connection auth middleware using JWT.
- **Frontend**:
  - Initialize Socket-client and setup provider.
  - Add "Online/Offline" status indicator.

**Day 23 (Jun 08): Permission-Based Messaging**

- **Backend**:
  - Create Chat Room logic based on Transaction history.
  - Implement logic: Messaging allowed ONLY if a transaction exists between users.
- **Frontend**:
  - Build "Messages" sidebar filtered by transacting users.

**Day 24 (Jun 09): Real-time Chat**

- **Backend**:
  - Implement Message schema and persistence in MongoDB.
  - Setup `send_message` and `receive_message` events.
- **Frontend**:
  - Build Chat UI (Bubbles, timestamps, scroll management).
  - Implement real-time typing indicators.

**Day 25 (Jun 10): Live Notifications**

- **Backend**:
  - Emit socket events for real-time transaction/message alerts.
- **Frontend**:
  - Design Notification Bell component with real-time count.

**Day 26 (Jun 11): Expenditure Analytics**

- **Backend**:
  - Build MongoDB Aggregation Pipelines for spending patterns.
- **Frontend**:
  - Integrate Charts (Recharts/Chart.js) for expense visualization.

**Day 27 (Jun 12): PDF Statement Generation**

- **Backend**:
  - Implement EJS template and PDF generation logic (Puppeteer/html-pdf).
- **Frontend**:
  - Add "Download Statement" buttons with date filtering.

**Day 28 (Jun 13): Admin/Manager Dashboard**

- **Backend**:
  - Build APIs for system stats and user approval queues.
- **Frontend**:
  - Build Admin management views and KYC approval UI.

---

## Phase 5: Final Polish & Delivery (Final Days)

**Day 29 (Jun 14): Optimization**

- **Backend**:
  - Query indexing and response compression.
- **Frontend**:
  - Code splitting and image lazy loading.
  - Run Lighthouse audit and fix performance bottlenecks.

**Day 30 (Jun 15): Message Queue Implementation**

- **Backend**:
  - Implement message queue for transaction alerts (Credit/Debit Alerts).
  - Implement message queue for chat messages.
  - Implement message queue for email notifications.
  - Implement message queue for audit logs.
- **Frontend**:
  - Integrate real-time notification alerts from the message queue.

**Day 31 (Jun 16): Settings, Dashboard & UI Refinements**

- **Backend**:
  - Endpoint for user profile image upload to S3.
  - Endpoint to fetch correct last login details and KYC status.
- **Frontend**:
  - Setting panel implementation.
  - Under profile, show correct last login details (remove demo data).
  - Under user profile, allow user to add an image (saved in S3) which must also be available in the navbar.
  - Dashboard: Remove "Apply for a Premium Card" section and its logic.
  - Accounts: Fetch KYC status dynamically from the backend.
  - Navbar: Remove search transaction bar.

**Day 32 (Jun 17): Cashier & Manager Role Dashboards**

- **Backend**:
  - Endpoints for Cashier approval of added funds.
  - Endpoints for Manager account freezing capability.
- **Frontend**:
  - CASHIER Dashboard: Require cashier approval when a user adds funds. Sidebar must include profile settings and approve txn pages.
  - MANAGER Dashboard: Restrict to profile settings and user management only, along with a new page for freezing accounts.

**Day 33 (Jun 18): Public Pages & Auth UI Updates**

- **Backend**:
  - Static endpoints or routing for new public pages.
- **Frontend**:
  - Login/Register: Remove LinkedIn, X, GitHub, email login options, and app title/logo from footer (keep just the copyright line).
  - Public Layout: Implement "Contact Us" and "What is PortalRupee" pages that don't require authentication.
  - Create Terms and Conditions page.
  - Create Guidelines and Interest Information pages.

**Day 34 (Jun 19): Deployment & Handover**

- **Backend**:
  - Finalize README and Postman collections.
  - Production deployment and CI/CD final check.
- **Frontend**:
  - Production build and final browser testing.

**Day 35 (Jun 20): Deployment Verification**

- **Backend & Frontend**:
  - Domain configuration and verification.
  - Production logs checking and monitoring setup.

---

## Key Milestone Checklist

- [x] Core Auth & Role Management Working (Day 7 - Apr 14)
- [x] Transaction Engine (Transfer/PIN) Working (Day 14 - Apr 21)
- [x] S3 Files & OTP Verification Ready (Day 21 - Jun 06)
- [x] Real-time Chat & Analytics Deployed (Day 28 - Jun 13)
- [x] Production Deployment Complete (Day 35 - Jun 20)
