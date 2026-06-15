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
  }
};

export const getChannel = () => channel;
