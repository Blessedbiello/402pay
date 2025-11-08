/**
 * Utility functions shared across 402pay packages
 */

import { PublicKey } from '@solana/web3.js';
import { TOKEN_DECIMALS, TokenType } from './index';

/**
 * Validate Solana public key
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert token amount to lamports/smallest unit
 */
export function toTokenAmount(amount: number, currency: TokenType): bigint {
  const decimals = TOKEN_DECIMALS[currency];
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

/**
 * Convert lamports/smallest unit to token amount
 */
export function fromTokenAmount(amount: bigint, currency: TokenType): number {
  const decimals = TOKEN_DECIMALS[currency];
  return Number(amount) / Math.pow(10, decimals);
}

/**
 * Generate a random nonce for payment requirements
 */
export function generateNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check if a timestamp is expired
 */
export function isExpired(timestamp: number): boolean {
  return Date.now() > timestamp;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: TokenType): string {
  return `${amount.toFixed(TOKEN_DECIMALS[currency])} ${currency}`;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        await sleep(delayMs * Math.pow(backoffMultiplier, attempt));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Truncate a string (useful for displaying addresses)
 */
export function truncate(str: string, startChars = 4, endChars = 4): string {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
