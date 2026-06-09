import Transaction from '../models/transaction.model.js';

export const checkChatPermission = async (user1Id, user2Id) => {
  if (!user1Id || !user2Id) return false;

  // Normalize IDs to strings for comparison
  const u1Str = user1Id.toString();
  const u2Str = user2Id.toString();

  if (u1Str === u2Str) return false; // Cannot chat with self

  // Open ecosystem messaging
  return true;
};
