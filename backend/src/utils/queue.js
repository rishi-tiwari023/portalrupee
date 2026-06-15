import Message from '../models/message.model.js';
import { getIO } from '../config/socket.js';
import { sendOTPMail, sendWelcomeMail } from './mailer.js';
import AuditLog from '../models/auditLog.model.js';
import { getChannel } from '../config/rabbitmq.js';

// Queue names
const QUEUES = {
  TRANSACTION_ALERTS: 'queue:transaction_alerts',
  CHAT_MESSAGES: 'queue:chat_messages',
  EMAILS: 'queue:emails',
  AUDIT_LOGS: 'queue:audit_logs',
};

/**
 * Enqueues a transaction notification job.
 * Falls back to direct socket emission if RabbitMQ is unavailable.
 */
export const enqueueTransactionAlert = async (data) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn('RabbitMQ channel is not open. Executing fallback for transaction alert.');
      const io = getIO();
      io.to(data.userId).emit('new_transaction_notification', data);
      return;
    }
    await channel.assertQueue(QUEUES.TRANSACTION_ALERTS, { durable: true });
    channel.sendToQueue(QUEUES.TRANSACTION_ALERTS, Buffer.from(JSON.stringify(data)), { persistent: true });
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
 * Falls back to direct DB creation and socket emission if RabbitMQ is unavailable.
 */
export const enqueueChatMessage = async (data) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn('RabbitMQ channel is not open. Executing fallback for chat message.');
      const newMessage = await Message.create(data);
      const io = getIO();
      io.to(data.roomId).emit('receive_message', newMessage);
      io.to(data.receiver).emit('new_message_notification', newMessage);
      return;
    }
    await channel.assertQueue(QUEUES.CHAT_MESSAGES, { durable: true });
    channel.sendToQueue(QUEUES.CHAT_MESSAGES, Buffer.from(JSON.stringify(data)), { persistent: true });
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
 * Falls back to immediate async mail sending if RabbitMQ is unavailable.
 */
export const enqueueEmail = async (data) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn('RabbitMQ channel is not open. Executing fallback for email dispatch.');
      if (data.type === 'welcome') {
        sendWelcomeMail(data.email, data.name).catch(console.error);
      } else if (data.type === 'otp') {
        sendOTPMail(data.email, data.otp, data.purpose).catch(console.error);
      }
      return;
    }
    await channel.assertQueue(QUEUES.EMAILS, { durable: true });
    channel.sendToQueue(QUEUES.EMAILS, Buffer.from(JSON.stringify(data)), { persistent: true });
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
 * Falls back to direct DB creation if RabbitMQ is unavailable.
 */
export const enqueueAuditLog = async (data) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn('RabbitMQ channel is not open. Executing fallback for audit log.');
      await AuditLog.create(data);
      return;
    }
    await channel.assertQueue(QUEUES.AUDIT_LOGS, { durable: true });
    channel.sendToQueue(QUEUES.AUDIT_LOGS, Buffer.from(JSON.stringify(data)), { persistent: true });
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

let isWorkerRunning = false;

/**
 * Starts the RabbitMQ Queue Worker Consumers.
 */
export const startQueueWorker = async () => {
  if (isWorkerRunning) return;
  
  const channel = getChannel();
  if (!channel) {
    console.error('Cannot start queue worker: RabbitMQ channel is not initialized.');
    return;
  }

  isWorkerRunning = true;
  console.log('RabbitMQ Queue Worker Initialized');

  const setupConsumer = async (queueName, processorFn) => {
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processorFn(data);
          channel.ack(msg);
        } catch (err) {
          console.error(`Worker error processing ${queueName}:`, err);
          // Nack message, don't requeue to avoid infinite loops on bad data
          channel.nack(msg, false, false);
        }
      }
    });
  };

  try {
    await setupConsumer(QUEUES.TRANSACTION_ALERTS, processTransactionAlert);
    await setupConsumer(QUEUES.CHAT_MESSAGES, processChatMessage);
    await setupConsumer(QUEUES.EMAILS, processEmail);
    await setupConsumer(QUEUES.AUDIT_LOGS, processAuditLog);
  } catch (err) {
    console.error('Failed to setup consumers:', err);
  }
};

export const stopQueueWorker = () => {
  isWorkerRunning = false;
  console.log('RabbitMQ Queue Worker logic stopped (channels/connections manage actual disconnects)');
};
