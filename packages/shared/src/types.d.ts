import { z } from 'zod';
/**
 * x402 Payment Protocol Types
 * Based on the HTTP 402 Payment Required status code
 */
export declare const TokenType: any;
export type TokenType = z.infer<typeof TokenType>;
export declare const PaymentScheme: any;
export type PaymentScheme = z.infer<typeof PaymentScheme>;
export declare const Network: any;
export type Network = z.infer<typeof Network>;
/**
 * x402 Payment Requirement
 * Sent by the server in the 402 response
 */
export declare const PaymentRequirement: any;
export type PaymentRequirement = z.infer<typeof PaymentRequirement>;
/**
 * x402 Payment Proof
 * Sent by the client to prove payment
 */
export declare const PaymentProof: any;
export type PaymentProof = z.infer<typeof PaymentProof>;
/**
 * Subscription plans
 */
export declare const SubscriptionPlan: any;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;
/**
 * Subscription instance
 */
export declare const Subscription: any;
export type Subscription = z.infer<typeof Subscription>;
/**
 * Usage record for metered billing
 */
export declare const UsageRecord: any;
export type UsageRecord = z.infer<typeof UsageRecord>;
/**
 * Transaction record
 */
export declare const Transaction: any;
export type Transaction = z.infer<typeof Transaction>;
/**
 * Agent wallet configuration
 */
export declare const AgentWallet: any;
export type AgentWallet = z.infer<typeof AgentWallet>;
/**
 * API Key for authentication
 */
export declare const ApiKey: any;
export type ApiKey = z.infer<typeof ApiKey>;
/**
 * Analytics event
 */
export declare const AnalyticsEvent: any;
export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;
//# sourceMappingURL=types.d.ts.map