import { z } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = validData.body;
    req.query = validData.query;
    req.params = validData.params;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors
      const errorMessages = error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }
    next(error);
  }
};

export default validate;
