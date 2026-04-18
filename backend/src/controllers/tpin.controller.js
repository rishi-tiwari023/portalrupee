import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

export const setTPIN = async (req, res, next) => {
  try {
    const { tpin } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+tpin');

    if (user && user.tpin) {
      return next(new AppError('TPIN is already set. Use change TPIN to update it.', 400));
    }

    user.tpin = tpin;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'TPIN set successfully!',
    });
  } catch (error) {
    next(error);
  }
};

export const changeTPIN = async (req, res, next) => {
  try {
    const { oldTPIN, newTPIN } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+tpin');

    if (!user || !user.tpin) {
      return next(new AppError('No TPIN found. Please set a TPIN first.', 400));
    }

    const isCorrect = await user.compareTPIN(oldTPIN, user.tpin);
    if (!isCorrect) {
      return next(new AppError('Incorrect old TPIN', 401));
    }

    user.tpin = newTPIN;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'TPIN changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
