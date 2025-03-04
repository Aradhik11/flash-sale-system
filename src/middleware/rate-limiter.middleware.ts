import rateLimit from 'express-rate-limit';

// Rate limiter for general API routes
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // Default: 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Rate limiter for purchase API to prevent abuse
export const purchaseLimiter = rateLimit({
  windowMs: Number(process.env.PURCHASE_RATE_LIMIT_WINDOW) * 60 * 1000 || 1 * 60 * 1000, // Default: 1 minute
  max: Number(process.env.PURCHASE_RATE_LIMIT_MAX) || 5, // Limit each IP to 5 purchase attempts per minute
  message: {
    success: false,
    error: 'Too many purchase attempts from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});