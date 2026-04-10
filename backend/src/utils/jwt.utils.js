import jwt from 'jsonwebtoken';

/**
 * Generate Access Token
 * @param {Object} user User object
 * @returns {String} JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Generate Refresh Token
 * @param {Object} user User object
 * @returns {String} JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Verify Token
 * @param {String} token Token to verify
 * @param {String} secret Secret key
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
