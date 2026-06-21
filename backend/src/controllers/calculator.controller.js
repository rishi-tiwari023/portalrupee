import { sendEmiMail } from '../utils/mailer.js';
import AppError from '../utils/AppError.js';

export const sendEmiDetailsEmail = async (req, res, next) => {
  try {
    const { email, emiDetails } = req.body;

    if (!email || !emiDetails) {
      return next(new AppError('Email and EMI details are required', 400));
    }

    const { loanAmount, tenure, interestRate, monthlyEMI, totalPayable, interestAmount } = emiDetails;

    if (!loanAmount || !tenure || !interestRate || !monthlyEMI) {
      return next(new AppError('Incomplete EMI details provided', 400));
    }

    // Send the beautifully formatted email
    await sendEmiMail(email, emiDetails);

    res.status(200).json({
      status: 'success',
      message: 'EMI details sent to your email successfully'
    });
  } catch (error) {
    next(error);
  }
};
