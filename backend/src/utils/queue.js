import redisClient from '../config/redis.js';
import Message from '../models/message.model.js';
import { getIO } from '../config/socket.js';
import { sendOTPMail, sendWelcomeMail } from './mailer.js';
import AuditLog from '../models/auditLog.model.js';

// Queue names
const QUEUES = {
  TRANSACTION_ALERTS: 'queue:transaction_alerts',
  CHAT_MESSAGES: 'queue:chat_messages',
  EMAILS: 'queue:emails',
  AUDIT_LOGS: 'queue:audit_logs',
};

/**
 * Enqueues a transaction notification job.
 * Falls back to direct socket emission if Redis is unavailable.
 */
export const enqueueTransactionAlert = async (data) => {
  try {
    if (!redisClient.isOpen) {
      console.warn('Redis client is not open. Executing fallback for transaction alert.');
      const io = getIO();
      io.to(data.userId).emit('new_transaction_notification', data);
      return;
    }
    await redisClient.rPush(QUEUES.TRANSACTION_ALERTS, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to enqueue transaction alert:', err);
    try {
      const io = getIO();
      io.to(data.userId).emit('new_transaction_notification', data);
    } catch (socketErr) {
      console.error('Fallback socket emit failed:', socketErr);
    }
  }
};

/**
 * Enqueues a chat message processing job.
 * Falls back to direct DB creation and socket emission if Redis is unavailable.
 */
export const enqueueChatMessage = async (data) => {
  try {
    if (!redisClient.isOpen) {
      console.warn('Redis client is not open. Executing fallback for chat message.');
      const newMessage = await Message.create(data);
      const io = getIO();
      io.to(data.roomId).emit('receive_message', newMessage);
      io.to(data.receiver).emit('new_message_notification', newMessage);
      return;
    }
    await redisClient.rPush(QUEUES.CHAT_MESSAGES, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to enqueue chat message:', err);
    try {
      const newMessage = await Message.create(data);
      const io = getIO();
      io.to(data.roomId).emit('receive_message', newMessage);
      io.to(data.receiver).emit('new_message_notification', newMessage);
    } catch (fallbackErr) {
      console.error('Fallback chat message handling failed:', fallbackErr);
    }
  }
};

/**
 * Enqueues an email dispatch job.
 * Falls back to immediate async mail sending if Redis is unavailable.
 */
export const enqueueEmail = async (data) => {
  try {
    if (!redisClient.isOpen) {
      console.warn('Redis client is not open. Executing fallback for email dispatch.');
      if (data.type === 'welcome') {
        sendWelcomeMail(data.email, data.name).catch(console.error);
      } else if (data.type === 'otp') {
        sendOTPMail(data.email, data.otp, data.purpose).catch(console.error);
      }
      return;
    }
    await redisClient.rPush(QUEUES.EMAILS, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to enqueue email:', err);
    if (data.type === 'welcome') {
      sendWelcomeMail(data.email, data.name).catch(console.error);
    } else if (data.type === 'otp') {
      sendOTPMail(data.email, data.otp, data.purpose).catch(console.error);
    }
  }
};

/**
 * Enqueues an audit log persistence job.
 * Falls back to direct DB creation if Redis is unavailable.
 */
export const enqueueAuditLog = async (data) => {
  try {
    if (!redisClient.isOpen) {
      console.warn('Redis client is not open. Executing fallback for audit log.');
      await AuditLog.create(data);
      return;
    }
    await redisClient.rPush(QUEUES.AUDIT_LOGS, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to enqueue audit log:', err);
    try {
      await AuditLog.create(data);
    } catch (dbErr) {
      console.error('Fallback audit log creation failed:', dbErr);
    }
  }
};

// Internal Queue Processors called by Worker Loop
const processTransactionAlert = async (data) => {
  const io = getIO();
  io.to(data.userId).emit('new_transaction_notification', {
    transactionId: data.transactionId,
    type: data.type,
    subType: data.subType,
    amount: data.amount,
    message: data.message,
    createdAt: data.createdAt,
  });
};

const processChatMessage = async (data) => {
  const newMessage = await Message.create({
    sender: data.sender,
    receiver: data.receiver,
    roomId: data.roomId,
    content: data.content
  });

  const io = getIO();
  io.to(data.roomId).emit('receive_message', newMessage);
  io.to(data.receiver).emit('new_message_notification', newMessage);
};

const processEmail = async (data) => {
  if (data.type === 'welcome') {
    await sendWelcomeMail(data.email, data.name);
  } else if (data.type === 'otp') {
    await sendOTPMail(data.email, data.otp, data.purpose);
  }
};

const processAuditLog = async (data) => {
  await AuditLog.create(data);
};

// Queue Worker Control State
let isRunning = false;

/**
 * Starts the Redis list-based Queue Worker Loop.
 */
export const startQueueWorker = () => {
  if (isRunning) return;
  isRunning = true;

  console.log('Queue Worker Loop Initialized');

  const workerLoop = async () => {
    while (isRunning) {
      try {
        if (!redisClient.isOpen) {
          // Wait if Redis client is offline
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        let processedAny = false;

        // 1. Transaction Alerts
        try {
          const txJob = await redisClient.lPop(QUEUES.TRANSACTION_ALERTS);
          if (txJob) {
            processedAny = true;
            const data = JSON.parse(txJob);
            await processTransactionAlert(data);
          }
        } catch (err) {
          console.error('Worker error processing transaction alert:', err);
        }

        // 2. Chat Messages
        try {
          const chatJob = await redisClient.lPop(QUEUES.CHAT_MESSAGES);
          if (chatJob) {
            processedAny = true;
            const data = JSON.parse(chatJob);
            await processChatMessage(data);
          }
        } catch (err) {
          console.error('Worker error processing chat message:', err);
        }

        // 3. Emails
        try {
          const emailJob = await redisClient.lPop(QUEUES.EMAILS);
          if (emailJob) {
            processedAny = true;
            const data = JSON.parse(emailJob);
            await processEmail(data);
          }
        } catch (err) {
          console.error('Worker error processing email:', err);
        }

        // 4. Audit Logs
        try {
          const auditJob = await redisClient.lPop(QUEUES.AUDIT_LOGS);
          if (auditJob) {
            processedAny = true;
            const data = JSON.parse(auditJob);
            await processAuditLog(data);
          }
        } catch (err) {
          console.error('Worker error processing audit log:', err);
        }

        // Prevent heavy loop when queues are idle
        if (!processedAny) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (err) {
        console.error('Queue worker main loop exception:', err);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  workerLoop();
};

/**
 * Stops the Queue Worker Loop.
 */
export const stopQueueWorker = () => {
  isRunning = false;
  console.log('Queue Worker Loop Stopped');
};
