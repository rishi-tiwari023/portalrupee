import { redisClient } from '../config/redis.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email, otp, purpose = 'general', ttl = 300) => {
  const key = `otp:${email}:${purpose}`;
  await redisClient.set(key, otp, { EX: ttl });
};

export const verifyOTP = async (email, otp, purpose = 'general') => {
  const key = `otp:${email}:${purpose}`;
  const storedOtp = await redisClient.get(key);

  if (!storedOtp) {
    return false;
  }

  if (storedOtp !== otp) {
    return false;
  }

  await redisClient.del(key);
  const verifiedKey = `otp_verified:${email}:${purpose}`;
  await redisClient.set(verifiedKey, 'true', { EX: 300 });

  return true;
};

export const isOTPVerified = async (email, purpose = 'general') => {
  const verifiedKey = `otp_verified:${email}:${purpose}`;
  const status = await redisClient.get(verifiedKey);
  return status === 'true';
};

export const clearOTPVerification = async (email, purpose = 'general') => {
  const verifiedKey = `otp_verified:${email}:${purpose}`;
  await redisClient.del(verifiedKey);
};
