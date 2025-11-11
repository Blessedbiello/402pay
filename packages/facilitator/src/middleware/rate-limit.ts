/**
 * Rate limiting middleware
 */

import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, ERROR_CODES, RATE_LIMITS } from '@402pay/shared';

/**
 * Rate limiter for public endpoints
 */
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.PUBLIC_ENDPOINT_PER_MINUTE,
  message: {
    error: 'Too many requests from this IP, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for authenticated endpoints
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.AUTHENTICATED_PER_MINUTE,
  message: {
    error: 'Too many requests, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use API key for rate limiting if available
    return req.headers.authorization || req.ip || 'unknown';
  },
});

/**
 * Rate limiter specifically for verification endpoint
 */
export const verificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.VERIFICATION_PER_MINUTE,
  message: {
    error: 'Too many verification requests, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by API key or IP
    return req.headers.authorization || req.ip || 'unknown';
  },
  // Skip successful requests in count (only count failures/attempts)
  skip: (req, res) => {
    return res.statusCode < 400;
  },
});
