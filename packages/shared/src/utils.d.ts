/**
 * Utility functions shared across 402pay packages
 */
import { TokenType } from './index';
/**
 * Validate Solana public key
 */
export declare function isValidPublicKey(key: string): boolean;
/**
 * Convert token amount to lamports/smallest unit
 */
export declare function toTokenAmount(amount: number, currency: TokenType): bigint;
/**
 * Convert lamports/smallest unit to token amount
 */
export declare function fromTokenAmount(amount: bigint, currency: TokenType): number;
/**
 * Generate a random nonce for payment requirements
 */
export declare function generateNonce(): string;
/**
 * Check if a timestamp is expired
 */
export declare function isExpired(timestamp: number): boolean;
/**
 * Format currency amount for display
 */
export declare function formatCurrency(amount: number, currency: TokenType): string;
/**
 * Sleep for a given number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
}): Promise<T>;
/**
 * Truncate a string (useful for displaying addresses)
 */
export declare function truncate(str: string, startChars?: number, endChars?: number): string;
//# sourceMappingURL=utils.d.ts.map