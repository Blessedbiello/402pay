"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEvent = exports.ApiKey = exports.AgentWallet = exports.Transaction = exports.UsageRecord = exports.Subscription = exports.SubscriptionPlan = exports.PaymentProof = exports.PaymentRequirement = exports.Network = exports.PaymentScheme = exports.TokenType = void 0;
const zod_1 = require("zod");
/**
 * x402 Payment Protocol Types
 * Based on the HTTP 402 Payment Required status code
 */
// Supported tokens on Solana
exports.TokenType = zod_1.z.enum(['USDC', 'USDT', 'SOL', 'PYUSD']);
// Payment schemes
exports.PaymentScheme = zod_1.z.enum([
    'exact', // Exact amount required
    'minimum', // Minimum amount required
    'range', // Within a range
    'subscription', // Recurring subscription
    'metered', // Usage-based billing
]);
// Network configuration
exports.Network = zod_1.z.enum(['mainnet-beta', 'devnet', 'testnet']);
/**
 * x402 Payment Requirement
 * Sent by the server in the 402 response
 */
exports.PaymentRequirement = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    currency: exports.TokenType,
    recipient: zod_1.z.string(), // Solana public key
    resource: zod_1.z.string(), // API endpoint being accessed
    nonce: zod_1.z.string(), // Prevent replay attacks
    expiresAt: zod_1.z.number(), // Unix timestamp
    scheme: exports.PaymentScheme,
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * x402 Payment Proof
 * Sent by the client to prove payment
 */
exports.PaymentProof = zod_1.z.object({
    signature: zod_1.z.string(), // Transaction signature on Solana
    payer: zod_1.z.string(), // Payer's public key
    amount: zod_1.z.number().positive(),
    currency: exports.TokenType,
    nonce: zod_1.z.string(), // Must match requirement
    timestamp: zod_1.z.number(), // Unix timestamp
    transactionId: zod_1.z.string().optional(), // Solana tx signature
});
/**
 * Subscription plans
 */
exports.SubscriptionPlan = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    pricePerMonth: zod_1.z.number().positive(),
    currency: exports.TokenType,
    features: zod_1.z.array(zod_1.z.string()).optional(),
    limits: zod_1.z
        .object({
        requestsPerMonth: zod_1.z.number().optional(),
        requestsPerDay: zod_1.z.number().optional(),
    })
        .optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Subscription instance
 */
exports.Subscription = zod_1.z.object({
    id: zod_1.z.string(),
    planId: zod_1.z.string(),
    agentId: zod_1.z.string(), // AI agent or customer identifier
    walletAddress: zod_1.z.string(), // Payer's Solana wallet
    status: zod_1.z.enum(['active', 'cancelled', 'expired', 'past_due']),
    currentPeriodStart: zod_1.z.number(), // Unix timestamp
    currentPeriodEnd: zod_1.z.number(), // Unix timestamp
    cancelAtPeriodEnd: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.number(),
    updatedAt: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Usage record for metered billing
 */
exports.UsageRecord = zod_1.z.object({
    id: zod_1.z.string(),
    subscriptionId: zod_1.z.string(),
    quantity: zod_1.z.number().positive(), // Number of API calls, tokens, etc.
    timestamp: zod_1.z.number(),
    resource: zod_1.z.string().optional(), // Which endpoint was called
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Transaction record
 */
exports.Transaction = zod_1.z.object({
    id: zod_1.z.string(),
    signature: zod_1.z.string(), // Solana transaction signature
    payer: zod_1.z.string(), // Payer's public key
    recipient: zod_1.z.string(), // Recipient's public key
    amount: zod_1.z.number().positive(),
    currency: exports.TokenType,
    resource: zod_1.z.string(), // API endpoint accessed
    status: zod_1.z.enum(['pending', 'confirmed', 'failed']),
    subscriptionId: zod_1.z.string().optional(),
    agentId: zod_1.z.string().optional(),
    timestamp: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Agent wallet configuration
 */
exports.AgentWallet = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    publicKey: zod_1.z.string(), // Solana public key
    owner: zod_1.z.string(), // Owner's public key
    spendingLimit: zod_1.z
        .object({
        daily: zod_1.z.number().positive().optional(),
        perTransaction: zod_1.z.number().positive().optional(),
    })
        .optional(),
    allowedServices: zod_1.z.array(zod_1.z.string()).optional(), // Whitelist of API endpoints
    reputation: zod_1.z
        .object({
        score: zod_1.z.number().min(0).max(1000),
        transactionCount: zod_1.z.number(),
        trustLevel: zod_1.z.enum(['new', 'verified', 'trusted', 'premium']),
    })
        .optional(),
    createdAt: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * API Key for authentication
 */
exports.ApiKey = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(), // The actual API key (hashed in DB)
    name: zod_1.z.string(),
    userId: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()),
    environment: zod_1.z.enum(['test', 'live']),
    createdAt: zod_1.z.number(),
    lastUsedAt: zod_1.z.number().optional(),
    expiresAt: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Analytics event
 */
exports.AnalyticsEvent = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['payment', 'subscription', 'usage', 'error']),
    timestamp: zod_1.z.number(),
    agentId: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional(),
    currency: exports.TokenType.optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
//# sourceMappingURL=types.js.map