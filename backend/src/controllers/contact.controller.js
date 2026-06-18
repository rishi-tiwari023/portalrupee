import { z } from 'zod';
import Contact from '../models/contact.model.js';
import AppError from '../utils/AppError.js';
import { sendContactMail } from '../utils/mailer.js';

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

/**
 * @desc    Submit a contact form message
 * @route   POST /api/v1/contact
 * @access  Public
 */
export const submitContactForm = async (req, res, next) => {
  try {
    // 1. Validate request body
    const validatedData = contactSchema.parse(req.body);

    // 2. Save to database
    const newContact = await Contact.create({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
    });

    // 3. Send email notification (non-blocking, catch errors so it doesn't fail the request)
    sendContactMail(validatedData).catch(err => {
      console.error('Failed to send contact notification email:', err.message);
    });

    // 4. Send response
    res.status(200).json({
      success: true,
      message: 'Message received. We will get back to you shortly.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.issues[0].message, 400));
    }
    next(error);
  }
};
