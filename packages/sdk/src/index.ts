/**
 * @402pay/sdk
 * TypeScript SDK for integrating x402 payments on Solana
 */

export { SolPay402, type SolPay402Config } from './client';
export { createPaymentMiddleware, type MiddlewareConfig } from './middleware';
export { SubscriptionManager, type CreateSubscriptionParams, type RecordUsageParams } from './subscriptions';
export { AgentManager, type CreateAgentParams, type AgentReputation } from './agents';

// Re-export shared types for convenience
export * from '@402pay/shared';
