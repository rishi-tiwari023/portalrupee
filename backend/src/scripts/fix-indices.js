import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/transaction.model.js';

dotenv.config();

const fixIndices = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    const collection = mongoose.connection.collection('transactions');
    
    console.log('Checking existing indexes on "transactions" collection...');
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    const indexName = 'referenceId_1';
    const indexExists = indexes.some(idx => idx.name === indexName);

    if (indexExists) {
      console.log(`Index "${indexName}" found. Dropping it...`);
      await collection.dropIndex(indexName);
      console.log(`Index "${indexName}" dropped successfully.`);
    } else {
      console.log(`Index "${indexName}" not found. No action needed.`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indices:', error);
    process.exit(1);
  }
};

fixIndices();
