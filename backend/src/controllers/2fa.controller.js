import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { encrypt, decrypt } from '../utils/encryption.util.js';

/**
 * Get 2FA Setup QR Code
 */
export const get2FASetup = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    
    let secret;
    if (user.twoFactorSecret) {
      try {
        secret = decrypt(user.twoFactorSecret);
      } catch (error) {
        // If decryption fails, generate a new one
        const newSecret = speakeasy.generateSecret({
          name: `PortalRupee (${user.email})`,
          issuer: 'PortalRupee',
        });
        secret = newSecret.base32;
        user.twoFactorSecret = encrypt(secret);
        await user.save();
      }
    } else {
      // Generate a new secret if not exists
      const newSecret = speakeasy.generateSecret({
        name: `PortalRupee (${user.email})`,
        issuer: 'PortalRupee',
      });
      secret = newSecret.base32;
      user.twoFactorSecret = encrypt(secret);
      await user.save();
    }

    // Generate otpauth URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `PortalRupee:${user.email}`,
      issuer: 'PortalRupee',
      encoding: 'base32',
    });

    // Generate QR Code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        secret: secret, // show secret for manual entry
        enabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable 2FA
 */
export const enable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(new AppError('OTP token is required', 400));
    }

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (!user.twoFactorSecret) {
      return next(new AppError('2FA setup not initiated', 400));
    }

    let secret;
    try {
      secret = decrypt(user.twoFactorSecret);
    } catch (error) {
      return next(new AppError('Failed to decrypt 2FA secret. Please re-setup 2FA.', 500));
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1, // Allow 1 cycle (30s) of clock drift
    });

    if (!verified) {
      return next(new AppError('Invalid OTP token', 400));
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      data: {
        twoFactorEnabled: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(new AppError('OTP token is required to disable 2FA', 400));
    }

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (!user.twoFactorEnabled) {
      return next(new AppError('2FA is not enabled', 400));
    }

    let secret;
    try {
      secret = decrypt(user.twoFactorSecret);
    } catch (error) {
      return next(new AppError('Failed to decrypt 2FA secret.', 500));
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!verified) {
      return next(new AppError('Invalid OTP token', 400));
    }

    user.twoFactorEnabled = false;
    // Keeping the secret for "same QR every time" requirement
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
      data: {
        twoFactorEnabled: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

