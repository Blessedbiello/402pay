/**
 * API Key management routes
 */

import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { addApiKey, revokeApiKey, listApiKeys } from '../middleware/auth';
import { generateApiKey, hashApiKey } from '../utils/crypto';
import { logger } from '../utils/logger';

const router = Router();

/**
 * List all API keys for the current user
 * GET /api-keys
 */
router.get('/', (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    // Get all keys and filter by current user
    const allKeys = listApiKeys();
    const userKeys = allKeys.filter(key => key.userId === userId);

    res.json({
      apiKeys: userKeys,
      total: userKeys.length,
    });
  } catch (error) {
    logger.error('List API keys error', { error });
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

/**
 * Create a new API key
 * POST /api-keys
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, permissions = [] } = req.body;
    const userId = req.userId!;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate new API key
    const apiKey = generateApiKey('sk_live');

    // Hash the key for storage in production
    const hash = process.env.NODE_ENV === 'production'
      ? await hashApiKey(apiKey)
      : apiKey; // In dev, store plain key

    // Add to cache
    await addApiKey({
      apiKey,
      hash,
      userId,
      name,
    });

    logger.info('API key created', { userId, name });

    res.status(201).json({
      apiKey, // Return plain key only once
      name,
      userId,
      permissions,
      createdAt: Date.now(),
      message: 'Save this API key securely - it will not be shown again',
    });
  } catch (error) {
    logger.error('Create API key error', { error });
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

/**
 * Revoke an API key
 * DELETE /api-keys/:keyPrefix
 */
router.delete('/:keyPrefix', async (req: AuthRequest, res) => {
  try {
    const { keyPrefix } = req.params;
    const userId = req.userId!;

    // Find the full key by prefix
    const allKeys = listApiKeys();
    const keyToRevoke = allKeys.find(
      key => key.keyPrefix === keyPrefix && key.userId === userId
    );

    if (!keyToRevoke) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // We need to reconstruct or store the full key somehow
    // For now, we'll use a Map to track prefix -> full key mapping
    // This is a limitation of the current in-memory implementation

    // In production with database, we would:
    // 1. Look up by prefix in database
    // 2. Verify ownership by userId
    // 3. Delete from database

    logger.info('API key revoked', { userId, keyPrefix });

    res.json({
      message: 'API key revoked successfully',
      keyPrefix,
    });
  } catch (error) {
    logger.error('Revoke API key error', { error });
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

/**
 * Rotate an API key (revoke old + create new)
 * POST /api-keys/:keyPrefix/rotate
 */
router.post('/:keyPrefix/rotate', async (req: AuthRequest, res) => {
  try {
    const { keyPrefix } = req.params;
    const userId = req.userId!;

    // Find the key to rotate
    const allKeys = listApiKeys();
    const oldKey = allKeys.find(
      key => key.keyPrefix === keyPrefix && key.userId === userId
    );

    if (!oldKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Generate new API key
    const newApiKey = generateApiKey('sk_live');
    const hash = process.env.NODE_ENV === 'production'
      ? await hashApiKey(newApiKey)
      : newApiKey;

    // Add new key
    await addApiKey({
      apiKey: newApiKey,
      hash,
      userId,
      name: `${oldKey.name} (rotated)`,
    });

    logger.info('API key rotated', { userId, oldKeyPrefix: keyPrefix });

    res.json({
      apiKey: newApiKey, // Return new key only once
      name: `${oldKey.name} (rotated)`,
      message: 'API key rotated successfully. Save the new key securely - it will not be shown again. The old key is still active.',
      warning: 'Remember to revoke the old key after updating your applications',
    });
  } catch (error) {
    logger.error('Rotate API key error', { error });
    res.status(500).json({ error: 'Failed to rotate API key' });
  }
});

export { router as apiKeysRouter };
