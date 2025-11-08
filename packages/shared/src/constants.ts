/**
 * Constants used across the 402pay platform
 */

import { Network, TokenType } from './types';

// Solana token mint addresses
export const TOKEN_MINTS: Record<TokenType, Record<Network, string>> = {
  USDC: {
    'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    testnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  },
  USDT: {
    'mainnet-beta': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    devnet: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
    testnet: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
  },
  SOL: {
    'mainnet-beta': 'So11111111111111111111111111111111111111112',
    devnet: 'So11111111111111111111111111111111111111112',
    testnet: 'So11111111111111111111111111111111111111112',
  },
  PYUSD: {
    'mainnet-beta': '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
    devnet: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo', // May not exist on devnet
    testnet: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
  },
};

// Token decimals
export const TOKEN_DECIMALS: Record<TokenType, number> = {
  USDC: 6,
  USDT: 6,
  SOL: 9,
  PYUSD: 6,
};

// Default RPC endpoints
export const DEFAULT_RPC_ENDPOINTS: Record<Network, string> = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

// Payment requirement expiration (5 minutes)
export const PAYMENT_REQUIREMENT_EXPIRATION = 5 * 60 * 1000;

// Default settlement delay (for deferred settlement)
export const DEFAULT_SETTLEMENT_DELAY = 24 * 60 * 60 * 1000; // 24 hours

// Minimum settlement amount (to avoid dust transactions)
export const MINIMUM_SETTLEMENT_AMOUNT = 1.0; // 1 USDC

// Rate limiting defaults
export const DEFAULT_RATE_LIMITS = {
  perMinute: 60,
  perHour: 1000,
  perDay: 10000,
};

// Agent reputation score thresholds
export const REPUTATION_THRESHOLDS = {
  new: 0,
  verified: 100,
  trusted: 500,
  premium: 800,
};

// HTTP status codes
export const HTTP_STATUS = {
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error codes
export const ERROR_CODES = {
  INVALID_PAYMENT: 'INVALID_PAYMENT',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  INSUFFICIENT_AMOUNT: 'INSUFFICIENT_AMOUNT',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  NONCE_MISMATCH: 'NONCE_MISMATCH',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  INVALID_API_KEY: 'INVALID_API_KEY',
} as const;
