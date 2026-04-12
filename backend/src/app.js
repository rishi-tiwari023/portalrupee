import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import globalErrorHandler from './middleware/errorMiddleware.js';
import AppError from './utils/AppError.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';


const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(globalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);


// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'PortalRupee Backend is healthy!',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
