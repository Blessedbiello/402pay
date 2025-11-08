import { z } from 'zod';

/**
 * x402 Payment Protocol Types
 * Based on the HTTP 402 Payment Required status code
 */

// Supported tokens on Solana
export const TokenType = z.enum(['USDC', 'USDT', 'SOL', 'PYUSD']);
export type TokenType = z.infer<typeof TokenType>;

// Payment schemes
export const PaymentScheme = z.enum([
  'exact', // Exact amount required
  'minimum', // Minimum amount required
  'range', // Within a range
  'subscription', // Recurring subscription
  'metered', // Usage-based billing
]);
export type PaymentScheme = z.infer<typeof PaymentScheme>;

// Network configuration
export const Network = z.enum(['mainnet-beta', 'devnet', 'testnet']);
export type Network = z.infer<typeof Network>;

/**
 * x402 Payment Requirement
 * Sent by the server in the 402 response
 */
export const PaymentRequirement = z.object({
  amount: z.number().positive(),
  currency: TokenType,
  recipient: z.string(), // Solana public key
  resource: z.string(), // API endpoint being accessed
  nonce: z.string(), // Prevent replay attacks
  expiresAt: z.number(), // Unix timestamp
  scheme: PaymentScheme,
  metadata: z.record(z.unknown()).optional(),
});
export type PaymentRequirement = z.infer<typeof PaymentRequirement>;

/**
 * x402 Payment Proof
 * Sent by the client to prove payment
 */
export const PaymentProof = z.object({
  signature: z.string(), // Transaction signature on Solana
  payer: z.string(), // Payer's public key
  amount: z.number().positive(),
  currency: TokenType,
  nonce: z.string(), // Must match requirement
  timestamp: z.number(), // Unix timestamp
  transactionId: z.string().optional(), // Solana tx signature
});
export type PaymentProof = z.infer<typeof PaymentProof>;

/**
 * Subscription plans
 */
export const SubscriptionPlan = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  pricePerMonth: z.number().positive(),
  currency: TokenType,
  features: z.array(z.string()).optional(),
  limits: z
    .object({
      requestsPerMonth: z.number().optional(),
      requestsPerDay: z.number().optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;

/**
 * Subscription instance
 */
export const Subscription = z.object({
  id: z.string(),
  planId: z.string(),
  agentId: z.string(), // AI agent or customer identifier
  walletAddress: z.string(), // Payer's Solana wallet
  status: z.enum(['active', 'cancelled', 'expired', 'past_due']),
  currentPeriodStart: z.number(), // Unix timestamp
  currentPeriodEnd: z.number(), // Unix timestamp
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
  metadata: z.record(z.unknown()).optional(),
});
export type Subscription = z.infer<typeof Subscription>;

/**
 * Usage record for metered billing
 */
export const UsageRecord = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  quantity: z.number().positive(), // Number of API calls, tokens, etc.
  timestamp: z.number(),
  resource: z.string().optional(), // Which endpoint was called
  metadata: z.record(z.unknown()).optional(),
});
export type UsageRecord = z.infer<typeof UsageRecord>;

/**
 * Transaction record
 */
export const Transaction = z.object({
  id: z.string(),
  signature: z.string(), // Solana transaction signature
  payer: z.string(), // Payer's public key
  recipient: z.string(), // Recipient's public key
  amount: z.number().positive(),
  currency: TokenType,
  resource: z.string(), // API endpoint accessed
  status: z.enum(['pending', 'confirmed', 'failed']),
  subscriptionId: z.string().optional(),
  agentId: z.string().optional(),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});
export type Transaction = z.infer<typeof Transaction>;

/**
 * Agent wallet configuration
 */
export const AgentWallet = z.object({
  id: z.string(),
  name: z.string(),
  publicKey: z.string(), // Solana public key
  owner: z.string(), // Owner's public key
  spendingLimit: z
    .object({
      daily: z.number().positive().optional(),
      perTransaction: z.number().positive().optional(),
    })
    .optional(),
  allowedServices: z.array(z.string()).optional(), // Whitelist of API endpoints
  reputation: z
    .object({
      score: z.number().min(0).max(1000),
      transactionCount: z.number(),
      trustLevel: z.enum(['new', 'verified', 'trusted', 'premium']),
    })
    .optional(),
  createdAt: z.number(),
  metadata: z.record(z.unknown()).optional(),
});
export type AgentWallet = z.infer<typeof AgentWallet>;

/**
 * API Key for authentication
 */
export const ApiKey = z.object({
  id: z.string(),
  key: z.string(), // The actual API key (hashed in DB)
  name: z.string(),
  userId: z.string(),
  permissions: z.array(z.string()),
  environment: z.enum(['test', 'live']),
  createdAt: z.number(),
  lastUsedAt: z.number().optional(),
  expiresAt: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ApiKey = z.infer<typeof ApiKey>;

/**
 * Analytics event
 */
export const AnalyticsEvent = z.object({
  id: z.string(),
  type: z.enum(['payment', 'subscription', 'usage', 'error']),
  timestamp: z.number(),
  agentId: z.string().optional(),
  resource: z.string().optional(),
  amount: z.number().optional(),
  currency: TokenType.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;
