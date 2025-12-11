const requestCounts = new Map();

/**
 * Rate limiter middleware factory
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Custom error message
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests from this IP, please try again later.',
    useUserId = false // If true, use userId for authenticated routes instead of IP
  } = options;

  return (req, res, next) => {
    // For authenticated routes, use userId if available, otherwise fall back to IP
    const clientId = useUserId && req.userId 
      ? `user_${req.userId.toString()}` 
      : req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(clientId)) {
      requestCounts.set(clientId, []);
    }

    const requests = requestCounts.get(clientId);
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    requestCounts.set(clientId, validRequests);

    if (validRequests.length >= maxRequests) {
      const retryAfter = Math.ceil((validRequests[0] + windowMs - now) / 1000);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: `${retryAfter} seconds`
      });
    }

    validRequests.push(now);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - validRequests.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000;

  for (const [clientId, requests] of requestCounts.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - maxAge);
    if (validRequests.length === 0) {
      requestCounts.delete(clientId);
    } else {
      requestCounts.set(clientId, validRequests);
    }
  }
}, 60 * 60 * 1000);

const rateLimiters = {
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
  }),

  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 30, // Increased from 10 to allow for retries and testing
    message: 'Too many authentication attempts. Please try again later.'
  }),

  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: 'Upload limit exceeded. Please try again later.'
  }),

  payment: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10, // Increased from 5 to allow for retries and testing
    message: 'Too many payment requests. Please try again later.',
    useUserId: true // Use user-based rate limiting for authenticated payment routes
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters
};

