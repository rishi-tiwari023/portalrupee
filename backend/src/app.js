import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import globalErrorHandler from './middleware/errorMiddleware.js';
import AppError from './utils/AppError.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import tpinRoutes from './routes/tpin.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import accountRoutes from './routes/account.routes.js';
import twoFactorRoutes from './routes/2fa.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(globalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route Registration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tpin', tpinRoutes);
app.use('/api/v1/2fa', twoFactorRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/uploads', uploadRoutes);


// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'PortalRupee Backend is healthy!',
    timestamp: new Date().toISOString(),
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
