/**
 * API Key authentication middleware with secure hashing
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '@402pay/shared';
import { verifyApiKey } from '../utils/crypto';
import { logger } from '../utils/logger';

// In-memory API key storage (replace with database in production)
// Format: Map<plainApiKey, { hash: string, userId: string }>
const API_KEYS_CACHE = new Map<
  string,
  { hash: string; userId: string; name: string; lastUsed: number }
>();

// Initialize with environment keys (for backward compatibility)
const VALID_API_KEYS = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);
VALID_API_KEYS.forEach((key, index) => {
  API_KEYS_CACHE.set(key, {
    hash: key, // In dev, we store plain keys
    userId: `user_${index}`,
    name: `Development Key ${index + 1}`,
    lastUsed: Date.now(),
  });
});

// Add demo-key for demo/development (always available for testing)
API_KEYS_CACHE.set('demo-key', {
  hash: 'demo-key',
  userId: 'demo-user',
  name: 'Demo API Key',
  lastUsed: Date.now(),
});

export interface AuthRequest extends Request {
  userId?: string;
  apiKey?: string;
  apiKeyName?: string;
}

/**
 * Middleware to authenticate API requests using Bearer tokens
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Support both Bearer token and x-api-key header for demo compatibility
    const authHeader = req.headers.authorization;
    const xApiKey = req.headers['x-api-key'] as string;

    let apiKey: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7); // Remove 'Bearer '
    } else if (xApiKey) {
      apiKey = xApiKey;
    }

    if (!apiKey) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Missing or invalid authorization header',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    // Check if API key exists in cache
    const cachedKey = API_KEYS_CACHE.get(apiKey);

    if (cachedKey) {
      // In development, allow plain key comparison
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        req.userId = cachedKey.userId;
        req.apiKey = apiKey;
        req.apiKeyName = cachedKey.name;

        // Update last used timestamp
        cachedKey.lastUsed = Date.now();

        return next();
      }

      // In production, verify against hash
      const isValid = await verifyApiKey(apiKey, cachedKey.hash);

      if (isValid) {
        req.userId = cachedKey.userId;
        req.apiKey = apiKey;
        req.apiKeyName = cachedKey.name;

        // Update last used timestamp
        cachedKey.lastUsed = Date.now();

        logger.info('API key authenticated', {
          userId: req.userId,
          keyName: req.apiKeyName,
        });

        return next();
      }
    }

    // API key not found or invalid
    logger.warn('Invalid API key attempt', {
      ip: req.ip,
      path: req.path,
      keyPrefix: apiKey.substring(0, 8) + '...',
    });

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Invalid API key',
      code: ERROR_CODES.INVALID_API_KEY,
    });
  } catch (error) {
    logger.error('Authentication error', { error });

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Authentication error',
    });
  }
}

/**
 * Add a new API key to the cache (for runtime management)
 */
export async function addApiKey(params: {
  apiKey: string;
  hash: string;
  userId: string;
  name: string;
}): Promise<void> {
  API_KEYS_CACHE.set(params.apiKey, {
    hash: params.hash,
    userId: params.userId,
    name: params.name,
    lastUsed: Date.now(),
  });

  logger.info('API key added', {
    userId: params.userId,
    name: params.name,
  });
}

/**
 * Revoke an API key
 */
export function revokeApiKey(apiKey: string): boolean {
  const existed = API_KEYS_CACHE.delete(apiKey);

  if (existed) {
    logger.info('API key revoked', { keyPrefix: apiKey.substring(0, 8) + '...' });
  }

  return existed;
}

/**
 * Get all active API keys (for management endpoints)
 */
export function listApiKeys(): Array<{
  userId: string;
  name: string;
  lastUsed: number;
  keyPrefix: string;
}> {
  return Array.from(API_KEYS_CACHE.entries()).map(([key, value]) => ({
    userId: value.userId,
    name: value.name,
    lastUsed: value.lastUsed,
    keyPrefix: key.substring(0, 8) + '...',
  }));
}
