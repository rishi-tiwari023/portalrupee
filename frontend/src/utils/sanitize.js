export const sanitizeInput = (val) => {
  if (typeof val !== 'string') return val;
  // Remove HTML tags to prevent HTML injection/XSS
  return val.replace(/<[^>]*>/g, '');
};
