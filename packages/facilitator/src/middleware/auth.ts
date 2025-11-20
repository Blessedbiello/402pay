/**
 * API Key authentication middleware with database-backed storage
 * SECURITY FIX: Replaced in-memory cache with Prisma for production use
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS, ERROR_CODES } from '@402pay/shared';
import { verifyApiKey, constantTimeCompare } from '../utils/crypto';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  apiKey?: string;
  apiKeyName?: string;
  apiKeyId?: string;
}

// In-memory cache for performance (short TTL)
const API_KEY_CACHE = new Map<string, {
  hash: string;
  userId: string;
  name: string;
  cachedAt: number;
  environment: string;
  permissions: string[];
}>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware to authenticate API requests using Bearer tokens or x-api-key header
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Support both Bearer token and x-api-key header
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

    // Special handling for demo-key in development only
    const NODE_ENV = process.env.NODE_ENV || 'development';
    if (apiKey === 'demo-key' && NODE_ENV !== 'production') {
      req.userId = 'demo-user';
      req.apiKey = apiKey;
      req.apiKeyName = 'Demo API Key (Development Only)';
      logger.info('Demo API key used (development mode)', { path: req.path });
      return next();
    }

    // Reject demo-key in production
    if (apiKey === 'demo-key' && NODE_ENV === 'production') {
      logger.error('Demo API key used in production!', { ip: req.ip });
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Demo API key is not allowed in production',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    // Check cache first (with expiry)
    const cached = API_KEY_CACHE.get(apiKey);
    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
      // Verify against hash using constant-time comparison
      const isValid = await verifyApiKey(apiKey, cached.hash);

      if (isValid) {
        req.userId = cached.userId;
        req.apiKey = apiKey;
        req.apiKeyName = cached.name;

        // Update last used in background (don't block request)
        updateLastUsedAsync(apiKey).catch(err =>
          logger.error('Failed to update last used', { error: err })
        );

        return next();
      } else {
        // Invalid key, remove from cache
        API_KEY_CACHE.delete(apiKey);
      }
    }

    // Not in cache or expired, check database
    const dbApiKey = await prisma.apiKey.findFirst({
      where: {
        key: apiKey, // In production, this should be hashed
        revoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!dbApiKey) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path,
        keyPrefix: apiKey.substring(0, 8) + '...',
      });

      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid or expired API key',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    // Verify key (in production, apiKey should be plain and dbApiKey.key should be hashed)
    // For now, we're doing a direct comparison but this should use bcrypt/hash verification
    const isValid = constantTimeCompare(apiKey, dbApiKey.key);

    if (!isValid) {
      logger.warn('API key verification failed', {
        ip: req.ip,
        keyPrefix: apiKey.substring(0, 8) + '...',
      });

      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid API key',
        code: ERROR_CODES.INVALID_API_KEY,
      });
    }

    // Cache the key for future requests
    API_KEY_CACHE.set(apiKey, {
      hash: dbApiKey.key,
      userId: dbApiKey.userId,
      name: dbApiKey.name,
      cachedAt: Date.now(),
      environment: dbApiKey.environment,
      permissions: dbApiKey.permissions,
    });

    req.userId = dbApiKey.userId;
    req.apiKey = apiKey;
    req.apiKeyName = dbApiKey.name;
    req.apiKeyId = dbApiKey.id;

    // Update last used in background
    updateLastUsedAsync(dbApiKey.id).catch(err =>
      logger.error('Failed to update last used', { error: err })
    );

    logger.info('API key authenticated', {
      userId: req.userId,
      keyName: req.apiKeyName,
      environment: dbApiKey.environment,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error });

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Authentication error',
    });
  }
}

/**
 * Update last used timestamp in background
 */
async function updateLastUsedAsync(apiKeyId: string): Promise<void> {
  try {
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsed: new Date() },
    });
  } catch (error) {
    // Log but don't throw - this is a background operation
    logger.error('Failed to update API key last used', { error, apiKeyId });
  }
}

/**
 * Create a new API key in the database
 */
export async function createApiKey(params: {
  name: string;
  userId: string;
  environment?: 'test' | 'live';
  permissions?: string[];
  expiresAt?: Date;
}): Promise<{ id: string; key: string }> {
  const { generateApiKey, hashApiKey } = await import('../utils/crypto');

  const plainKey = generateApiKey('sk');
  const hashedKey = await hashApiKey(plainKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashedKey, // Store hashed key
      name: params.name,
      userId: params.userId,
      environment: params.environment || 'live',
      permissions: params.permissions || [],
      expiresAt: params.expiresAt,
      revoked: false,
    },
  });

  logger.info('API key created', {
    id: apiKey.id,
    userId: params.userId,
    name: params.name,
  });

  // Return plain key only once (user must save it)
  return {
    id: apiKey.id,
    key: plainKey,
  };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(apiKeyId: string): Promise<boolean> {
  try {
    const updated = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { revoked: true },
    });

    // Remove from cache
    API_KEY_CACHE.forEach((value, key) => {
      if (value.userId === updated.userId) {
        API_KEY_CACHE.delete(key);
      }
    });

    logger.info('API key revoked', { apiKeyId: updated.id });

    return true;
  } catch (error) {
    logger.error('Failed to revoke API key', { error, apiKeyId });
    return false;
  }
}

/**
 * List API keys for a user
 */
export async function listApiKeys(userId: string): Promise<Array<{
  id: string;
  name: string;
  environment: string;
  createdAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  revoked: boolean;
}>> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      environment: true,
      createdAt: true,
      lastUsed: true,
      expiresAt: true,
      revoked: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return keys;
}

// Clean up on shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
});
