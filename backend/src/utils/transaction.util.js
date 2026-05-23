import mongoose from 'mongoose';

/**
 * Runs a function within a Mongoose transaction with automatic retries for Write Conflicts.
 * @param {Function} fn The function to run within the transaction. Must accept (session) as argument.
 * @returns {Promise<any>} The result of the function.
 */
export const runInTransaction = async (fn) => {
  let retries = 5;
  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Check if it's a Transient Transaction Error (like Write Conflict)
      const isTransient = error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError');
      const isWriteConflict = error.code === 112 || (error.message && error.message.includes('Write conflict'));

      if ((isTransient || isWriteConflict) && attempt < retries) {
        console.log(`[Transaction] Write conflict on attempt ${attempt}. Retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 * attempt));
        continue;
      }
      throw error;
    }
  }
};
