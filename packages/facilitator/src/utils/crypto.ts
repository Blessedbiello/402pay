/**
 * Cryptographic utilities for secure API key handling
 */

import crypto from 'crypto';

/**
 * Hash an API key using PBKDF2 (demo - use bcrypt in production)
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(apiKey, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify an API key against a hash using constant-time comparison
 * This prevents timing attacks
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  try {
    const [salt, originalHash] = hash.split(':');
    if (!salt || !originalHash) return false;

    const testHash = crypto.pbkdf2Sync(apiKey, salt, 100000, 64, 'sha512').toString('hex');
    return constantTimeCompare(testHash, originalHash);
  } catch (error) {
    // Invalid hash format or other error
    return false;
  }
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(prefix: string = 'sk'): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('base64url');
  return `${prefix}_${key}`;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Use this for comparing secrets, tokens, etc.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still compare to prevent early exit timing leak
    // Compare against a same-length dummy string
    b = a;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate a secure random token for various purposes
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Hash a password or secret using SHA-256
 * Note: Use bcrypt for API keys, this is for general hashing
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
