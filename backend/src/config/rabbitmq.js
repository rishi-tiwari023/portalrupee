import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

let channel = null;
let connection = null;

export const connectRabbitMQ = async () => {
  try {
    const amqpServer = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    console.log('RabbitMQ Client Connected');
  } catch (err) {
    console.error('RabbitMQ Connection Error:', err);
    console.error('Failed to connect to RabbitMQ. Forcing process exit to allow Docker to auto-restart.');
    process.exit(1);
  }
};

export const getChannel = () => channel;
