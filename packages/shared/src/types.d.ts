import { z } from 'zod';
/**
 * x402 Payment Protocol Types
 * Based on the HTTP 402 Payment Required status code
 */
export declare const TokenType: z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>;
export type TokenType = z.infer<typeof TokenType>;
export declare const PaymentScheme: z.ZodEnum<["exact", "minimum", "range", "subscription", "metered"]>;
export type PaymentScheme = z.infer<typeof PaymentScheme>;
export declare const Network: z.ZodEnum<["mainnet-beta", "devnet", "testnet"]>;
export type Network = z.infer<typeof Network>;
/**
 * x402 Payment Requirement
 * Sent by the server in the 402 response
 */
export declare const PaymentRequirement: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>;
    recipient: z.ZodString;
    resource: z.ZodString;
    nonce: z.ZodString;
    expiresAt: z.ZodNumber;
    scheme: z.ZodEnum<["exact", "minimum", "range", "subscription", "metered"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    recipient: string;
    resource: string;
    nonce: string;
    expiresAt: number;
    scheme: "minimum" | "exact" | "range" | "subscription" | "metered";
    metadata?: Record<string, unknown> | undefined;
}, {
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    recipient: string;
    resource: string;
    nonce: string;
    expiresAt: number;
    scheme: "minimum" | "exact" | "range" | "subscription" | "metered";
    metadata?: Record<string, unknown> | undefined;
}>;
export type PaymentRequirement = z.infer<typeof PaymentRequirement>;
/**
 * x402 Payment Proof
 * Sent by the client to prove payment
 */
export declare const PaymentProof: z.ZodObject<{
    signature: z.ZodString;
    payer: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>;
    nonce: z.ZodString;
    timestamp: z.ZodNumber;
    transactionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    nonce: string;
    signature: string;
    payer: string;
    timestamp: number;
    transactionId?: string | undefined;
}, {
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    nonce: string;
    signature: string;
    payer: string;
    timestamp: number;
    transactionId?: string | undefined;
}>;
export type PaymentProof = z.infer<typeof PaymentProof>;
/**
 * Subscription plans
 */
export declare const SubscriptionPlan: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    pricePerMonth: z.ZodNumber;
    currency: z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limits: z.ZodOptional<z.ZodObject<{
        requestsPerMonth: z.ZodOptional<z.ZodNumber>;
        requestsPerDay: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requestsPerMonth?: number | undefined;
        requestsPerDay?: number | undefined;
    }, {
        requestsPerMonth?: number | undefined;
        requestsPerDay?: number | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    id: string;
    name: string;
    pricePerMonth: number;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    features?: string[] | undefined;
    limits?: {
        requestsPerMonth?: number | undefined;
        requestsPerDay?: number | undefined;
    } | undefined;
}, {
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    id: string;
    name: string;
    pricePerMonth: number;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    features?: string[] | undefined;
    limits?: {
        requestsPerMonth?: number | undefined;
        requestsPerDay?: number | undefined;
    } | undefined;
}>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;
/**
 * Subscription instance
 */
export declare const Subscription: z.ZodObject<{
    id: z.ZodString;
    planId: z.ZodString;
    agentId: z.ZodString;
    walletAddress: z.ZodString;
    status: z.ZodEnum<["active", "cancelled", "expired", "past_due"]>;
    currentPeriodStart: z.ZodNumber;
    currentPeriodEnd: z.ZodNumber;
    cancelAtPeriodEnd: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "cancelled" | "expired" | "past_due";
    id: string;
    planId: string;
    agentId: string;
    walletAddress: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    createdAt: number;
    updatedAt: number;
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "active" | "cancelled" | "expired" | "past_due";
    id: string;
    planId: string;
    agentId: string;
    walletAddress: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    createdAt: number;
    updatedAt: number;
    metadata?: Record<string, unknown> | undefined;
    cancelAtPeriodEnd?: boolean | undefined;
}>;
export type Subscription = z.infer<typeof Subscription>;
/**
 * Usage record for metered billing
 */
export declare const UsageRecord: z.ZodObject<{
    id: z.ZodString;
    subscriptionId: z.ZodString;
    quantity: z.ZodNumber;
    timestamp: z.ZodNumber;
    resource: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    id: string;
    subscriptionId: string;
    quantity: number;
    resource?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    timestamp: number;
    id: string;
    subscriptionId: string;
    quantity: number;
    resource?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type UsageRecord = z.infer<typeof UsageRecord>;
/**
 * Transaction record
 */
export declare const Transaction: z.ZodObject<{
    id: z.ZodString;
    signature: z.ZodString;
    payer: z.ZodString;
    recipient: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>;
    resource: z.ZodString;
    status: z.ZodEnum<["pending", "confirmed", "failed"]>;
    subscriptionId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "confirmed" | "failed";
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    recipient: string;
    resource: string;
    signature: string;
    payer: string;
    timestamp: number;
    id: string;
    metadata?: Record<string, unknown> | undefined;
    agentId?: string | undefined;
    subscriptionId?: string | undefined;
}, {
    status: "pending" | "confirmed" | "failed";
    amount: number;
    currency: "USDC" | "USDT" | "SOL" | "PYUSD";
    recipient: string;
    resource: string;
    signature: string;
    payer: string;
    timestamp: number;
    id: string;
    metadata?: Record<string, unknown> | undefined;
    agentId?: string | undefined;
    subscriptionId?: string | undefined;
}>;
export type Transaction = z.infer<typeof Transaction>;
/**
 * Agent wallet configuration
 */
export declare const AgentWallet: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    publicKey: z.ZodString;
    owner: z.ZodString;
    spendingLimit: z.ZodOptional<z.ZodObject<{
        daily: z.ZodOptional<z.ZodNumber>;
        perTransaction: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        daily?: number | undefined;
        perTransaction?: number | undefined;
    }, {
        daily?: number | undefined;
        perTransaction?: number | undefined;
    }>>;
    allowedServices: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    reputation: z.ZodOptional<z.ZodObject<{
        score: z.ZodNumber;
        transactionCount: z.ZodNumber;
        trustLevel: z.ZodEnum<["new", "verified", "trusted", "premium"]>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        transactionCount: number;
        trustLevel: "new" | "verified" | "trusted" | "premium";
    }, {
        score: number;
        transactionCount: number;
        trustLevel: "new" | "verified" | "trusted" | "premium";
    }>>;
    createdAt: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: number;
    publicKey: string;
    owner: string;
    metadata?: Record<string, unknown> | undefined;
    spendingLimit?: {
        daily?: number | undefined;
        perTransaction?: number | undefined;
    } | undefined;
    allowedServices?: string[] | undefined;
    reputation?: {
        score: number;
        transactionCount: number;
        trustLevel: "new" | "verified" | "trusted" | "premium";
    } | undefined;
}, {
    id: string;
    name: string;
    createdAt: number;
    publicKey: string;
    owner: string;
    metadata?: Record<string, unknown> | undefined;
    spendingLimit?: {
        daily?: number | undefined;
        perTransaction?: number | undefined;
    } | undefined;
    allowedServices?: string[] | undefined;
    reputation?: {
        score: number;
        transactionCount: number;
        trustLevel: "new" | "verified" | "trusted" | "premium";
    } | undefined;
}>;
export type AgentWallet = z.infer<typeof AgentWallet>;
/**
 * API Key for authentication
 */
export declare const ApiKey: z.ZodObject<{
    id: z.ZodString;
    key: z.ZodString;
    name: z.ZodString;
    userId: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
    environment: z.ZodEnum<["test", "live"]>;
    createdAt: z.ZodNumber;
    lastUsedAt: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: number;
    key: string;
    userId: string;
    permissions: string[];
    environment: "test" | "live";
    expiresAt?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
    lastUsedAt?: number | undefined;
}, {
    id: string;
    name: string;
    createdAt: number;
    key: string;
    userId: string;
    permissions: string[];
    environment: "test" | "live";
    expiresAt?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
    lastUsedAt?: number | undefined;
}>;
export type ApiKey = z.infer<typeof ApiKey>;
/**
 * Analytics event
 */
export declare const AnalyticsEvent: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["payment", "subscription", "usage", "error"]>;
    timestamp: z.ZodNumber;
    agentId: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodEnum<["USDC", "USDT", "SOL", "PYUSD"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "subscription" | "payment" | "usage" | "error";
    timestamp: number;
    id: string;
    amount?: number | undefined;
    currency?: "USDC" | "USDT" | "SOL" | "PYUSD" | undefined;
    resource?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    agentId?: string | undefined;
}, {
    type: "subscription" | "payment" | "usage" | "error";
    timestamp: number;
    id: string;
    amount?: number | undefined;
    currency?: "USDC" | "USDT" | "SOL" | "PYUSD" | undefined;
    resource?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    agentId?: string | undefined;
}>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;
//# sourceMappingURL=types.d.ts.map