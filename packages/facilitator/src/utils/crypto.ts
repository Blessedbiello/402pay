/**
 * Cryptographic utilities for secure API key handling
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12; // Industry standard for bcrypt

/**
 * Hash an API key using bcrypt
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify an API key against a hash using constant-time comparison
 * This prevents timing attacks
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(apiKey, hash);
  } catch (error) {
    // Invalid hash format or other bcrypt error
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
