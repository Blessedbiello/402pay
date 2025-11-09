"use strict";
/**
 * Constants used across the 402pay platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.PAYMENT_PROOF_EXPIRY_MS = exports.ERROR_CODES = exports.HTTP_STATUS = exports.REPUTATION_THRESHOLDS = exports.DEFAULT_RATE_LIMITS = exports.MINIMUM_SETTLEMENT_AMOUNT = exports.DEFAULT_SETTLEMENT_DELAY = exports.PAYMENT_REQUIREMENT_EXPIRATION = exports.DEFAULT_RPC_ENDPOINTS = exports.TOKEN_DECIMALS = exports.TOKEN_MINTS = void 0;
// Solana token mint addresses
exports.TOKEN_MINTS = {
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
exports.TOKEN_DECIMALS = {
    USDC: 6,
    USDT: 6,
    SOL: 9,
    PYUSD: 6,
};
// Default RPC endpoints
exports.DEFAULT_RPC_ENDPOINTS = {
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
};
// Payment requirement expiration (5 minutes)
exports.PAYMENT_REQUIREMENT_EXPIRATION = 5 * 60 * 1000;
// Default settlement delay (for deferred settlement)
exports.DEFAULT_SETTLEMENT_DELAY = 24 * 60 * 60 * 1000; // 24 hours
// Minimum settlement amount (to avoid dust transactions)
exports.MINIMUM_SETTLEMENT_AMOUNT = 1.0; // 1 USDC
// Rate limiting defaults
exports.DEFAULT_RATE_LIMITS = {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
};
// Agent reputation score thresholds
exports.REPUTATION_THRESHOLDS = {
    new: 0,
    verified: 100,
    trusted: 500,
    premium: 800,
};
// HTTP status codes
exports.HTTP_STATUS = {
    PAYMENT_REQUIRED: 402,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};
// Error codes
exports.ERROR_CODES = {
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
    AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
    RECIPIENT_MISMATCH: 'RECIPIENT_MISMATCH',
    CURRENCY_MISMATCH: 'CURRENCY_MISMATCH',
    REPLAY_ATTACK: 'REPLAY_ATTACK',
};
// Payment proof expiration time (15 minutes)
exports.PAYMENT_PROOF_EXPIRY_MS = 15 * 60 * 1000;
// API rate limits
exports.RATE_LIMITS = {
    PUBLIC_ENDPOINT_PER_MINUTE: 60,
    AUTHENTICATED_PER_MINUTE: 300,
    VERIFICATION_PER_MINUTE: 100,
};
//# sourceMappingURL=constants.js.map