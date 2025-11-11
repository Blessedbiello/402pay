/**
 * Redis client for caching and nonce tracking
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

export class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err });
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();

      logger.info('Redis client initialized', { url: redisUrl });
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      // Don't throw - allow app to run without Redis
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  /**
   * Check if nonce has been used (for replay attack prevention)
   */
  async hasNonce(nonce: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false; // Fallback to in-memory if Redis unavailable
    }

    try {
      const exists = await this.client.exists(`nonce:${nonce}`);
      return exists === 1;
    } catch (error) {
      logger.error('Redis hasNonce error', { error, nonce });
      return false;
    }
  }

  /**
   * Mark nonce as used with expiration (15 minutes)
   */
  async setNonce(nonce: string, ttlSeconds: number = 900): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.setEx(`nonce:${nonce}`, ttlSeconds, Date.now().toString());
      return true;
    } catch (error) {
      logger.error('Redis setNonce error', { error, nonce });
      return false;
    }
  }

  /**
   * Cache payment verification result
   */
  async cachePaymentVerification(
    transactionId: string,
    result: { valid: boolean; data?: any },
    ttlSeconds: number = 3600
  ): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.setEx(
        `payment:${transactionId}`,
        ttlSeconds,
        JSON.stringify(result)
      );
    } catch (error) {
      logger.error('Redis cache error', { error, transactionId });
    }
  }

  /**
   * Get cached payment verification result
   */
  async getCachedPaymentVerification(
    transactionId: string
  ): Promise<{ valid: boolean; data?: any } | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const cached = await this.client.get(`payment:${transactionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Redis get cache error', { error, transactionId });
      return null;
    }
  }

  /**
   * Increment a counter (for rate limiting, metrics, etc.)
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const count = await this.client.incr(key);
      if (ttlSeconds && count === 1) {
        // Set expiry only on first increment
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      logger.error('Redis increment error', { error, key });
      return 0;
    }
  }

  /**
   * Generic get
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error', { error, key });
      return null;
    }
  }

  /**
   * Generic set with optional TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error', { error, key });
      return false;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis del error', { error, key });
      return false;
    }
  }

  /**
   * Check if Redis is connected and available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
