/**
 * API Key authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '@402pay/shared';

// In production, this would query the database
// For now, we'll use environment variables
const VALID_API_KEYS = new Set(
  (process.env.VALID_API_KEYS || '').split(',').filter(Boolean)
);

export interface AuthRequest extends Request {
  userId?: string;
  apiKey?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Missing or invalid authorization header',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer '

    // Validate API key
    if (!VALID_API_KEYS.has(apiKey) && process.env.NODE_ENV !== 'development') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid API key',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    // In production, fetch user ID from database based on API key
    req.userId = 'user_' + apiKey.substring(0, 8);
    req.apiKey = apiKey;

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Authentication error',
    });
  }
}
