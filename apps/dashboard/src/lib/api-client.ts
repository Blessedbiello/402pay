/**
 * API Client for 402pay Facilitator Backend
 *
 * Provides typed API functions for all facilitator endpoints.
 * Base URL configured via NEXT_PUBLIC_FACILITATOR_URL environment variable.
 */

import type {
  PaymentProof,
  Transaction,
  Subscription,
  SubscriptionPlan,
  AgentWallet,
  AnalyticsEvent,
  TokenType,
} from '@402pay/shared';

// Base URL for the facilitator API
const BASE_URL = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'demo_key';

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses (e.g., 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiClientError({
        error: data.error || 'API Error',
        message: data.message || `Request failed with status ${response.status}`,
        statusCode: response.status,
        details: data.details,
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or parsing errors
    throw new ApiClientError({
      error: 'NetworkError',
      message: error instanceof Error ? error.message : 'Network request failed',
      statusCode: 0,
    });
  }
}

// ============================================================================
// Payment Verification
// ============================================================================

export interface VerifyPaymentResponse {
  verified: boolean;
  transaction: Transaction;
  accessToken?: string;
  expiresAt?: number;
}

/**
 * Verify a payment proof
 * POST /verify
 */
export async function verifyPayment(
  proof: PaymentProof
): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>('/verify', {
    method: 'POST',
    body: JSON.stringify(proof),
  });
}

// ============================================================================
// Analytics
// ============================================================================

export interface TransactionQueryParams {
  startDate?: number; // Unix timestamp
  endDate?: number; // Unix timestamp
  agentId?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  currency?: TokenType;
  limit?: number;
  offset?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get transactions with optional filters
 * GET /analytics/transactions
 */
export async function getTransactions(
  params?: TransactionQueryParams
): Promise<TransactionsResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = query ? `/analytics/transactions?${query}` : '/analytics/transactions';

  return apiFetch<TransactionsResponse>(endpoint);
}

export interface RevenueData {
  period: string; // 'day', 'week', 'month', 'year'
  total: number;
  currency: TokenType;
  breakdown: Array<{
    date: string; // ISO date string
    amount: number;
    transactionCount: number;
  }>;
}

/**
 * Get revenue analytics
 * GET /analytics/revenue
 */
export async function getRevenue(
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<RevenueData> {
  return apiFetch<RevenueData>(`/analytics/revenue?period=${period}`);
}

export interface TopAgent {
  agentId: string;
  agentName: string;
  totalSpent: number;
  transactionCount: number;
  lastActive: number; // Unix timestamp
}

export interface TopAgentsResponse {
  agents: TopAgent[];
  period: string;
}

/**
 * Get top agents by spending
 * GET /analytics/top-agents
 */
export async function getTopAgents(
  limit: number = 10
): Promise<TopAgentsResponse> {
  return apiFetch<TopAgentsResponse>(`/analytics/top-agents?limit=${limit}`);
}

export interface AnalyticsEventsResponse {
  events: AnalyticsEvent[];
  total: number;
}

/**
 * Get analytics events
 * GET /analytics/events
 */
export async function getAnalyticsEvents(
  params?: {
    type?: 'payment' | 'subscription' | 'usage' | 'error';
    agentId?: string;
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  }
): Promise<AnalyticsEventsResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = query ? `/analytics/events?${query}` : '/analytics/events';

  return apiFetch<AnalyticsEventsResponse>(endpoint);
}

// ============================================================================
// Subscriptions
// ============================================================================

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
}

/**
 * Get all subscriptions
 * GET /subscriptions
 */
export async function getSubscriptions(
  params?: {
    status?: 'active' | 'cancelled' | 'expired' | 'past_due';
    agentId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<SubscriptionsResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = query ? `/subscriptions?${query}` : '/subscriptions';

  return apiFetch<SubscriptionsResponse>(endpoint);
}

/**
 * Get a single subscription by ID
 * GET /subscriptions/:id
 */
export async function getSubscription(id: string): Promise<Subscription> {
  return apiFetch<Subscription>(`/subscriptions/${id}`);
}

export interface CreateSubscriptionData {
  planId: string;
  agentId: string;
  walletAddress: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new subscription
 * POST /subscriptions
 */
export async function createSubscription(
  data: CreateSubscriptionData
): Promise<Subscription> {
  return apiFetch<Subscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface CancelSubscriptionResponse {
  subscription: Subscription;
  message: string;
}

/**
 * Cancel a subscription
 * POST /subscriptions/:id/cancel
 */
export async function cancelSubscription(
  id: string,
  cancelAtPeriodEnd: boolean = true
): Promise<CancelSubscriptionResponse> {
  return apiFetch<CancelSubscriptionResponse>(`/subscriptions/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancelAtPeriodEnd }),
  });
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  total: number;
}

/**
 * Get available subscription plans
 * GET /subscriptions/plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  return apiFetch<SubscriptionPlansResponse>('/subscriptions/plans');
}

// ============================================================================
// Agent Wallets
// ============================================================================

export interface AgentsResponse {
  agents: AgentWallet[];
  total: number;
}

/**
 * Get all agent wallets
 * GET /agents
 */
export async function getAgents(
  params?: {
    limit?: number;
    offset?: number;
    owner?: string;
  }
): Promise<AgentsResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const query = queryParams.toString();
  const endpoint = query ? `/agents?${query}` : '/agents';

  return apiFetch<AgentsResponse>(endpoint);
}

/**
 * Get a single agent wallet by ID
 * GET /agents/:id
 */
export async function getAgent(id: string): Promise<AgentWallet> {
  return apiFetch<AgentWallet>(`/agents/${id}`);
}

export interface CreateAgentData {
  name: string;
  publicKey: string;
  owner: string;
  spendingLimit?: {
    daily?: number;
    perTransaction?: number;
  };
  allowedServices?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Create a new agent wallet
 * POST /agents
 */
export async function createAgent(data: CreateAgentData): Promise<AgentWallet> {
  return apiFetch<AgentWallet>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface UpdateAgentData {
  name?: string;
  spendingLimit?: {
    daily?: number;
    perTransaction?: number;
  };
  allowedServices?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Update an agent wallet
 * PATCH /agents/:id
 */
export async function updateAgent(
  id: string,
  data: UpdateAgentData
): Promise<AgentWallet> {
  return apiFetch<AgentWallet>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an agent wallet
 * DELETE /agents/:id
 */
export async function deleteAgent(id: string): Promise<void> {
  return apiFetch<void>(`/agents/${id}`, {
    method: 'DELETE',
  });
}

export interface AgentReputation {
  agentId: string;
  score: number;
  transactionCount: number;
  trustLevel: 'new' | 'verified' | 'trusted' | 'premium';
  totalSpent: number;
  averageTransactionSize: number;
  successRate: number; // Percentage of successful transactions
  history: Array<{
    timestamp: number;
    score: number;
    event: string;
  }>;
}

/**
 * Get agent reputation data
 * GET /agents/:id/reputation
 */
export async function getAgentReputation(id: string): Promise<AgentReputation> {
  return apiFetch<AgentReputation>(`/agents/${id}/reputation`);
}

// ============================================================================
// API Keys Management
// ============================================================================

export interface ApiKeyListItem {
  userId: string;
  name: string;
  lastUsed: number;
  keyPrefix: string;
}

export interface ApiKeysResponse {
  apiKeys: ApiKeyListItem[];
  total: number;
}

/**
 * List all API keys for the current user
 * GET /api-keys
 */
export async function listApiKeys(): Promise<ApiKeysResponse> {
  return apiFetch<ApiKeysResponse>('/api-keys');
}

export interface CreateApiKeyData {
  name: string;
  permissions?: string[];
}

export interface CreateApiKeyResponse {
  apiKey: string;
  name: string;
  userId: string;
  permissions: string[];
  createdAt: number;
  message: string;
}

/**
 * Create a new API key
 * POST /api-keys
 */
export async function createApiKey(
  data: CreateApiKeyData
): Promise<CreateApiKeyResponse> {
  return apiFetch<CreateApiKeyResponse>('/api-keys', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface RevokeApiKeyResponse {
  message: string;
  keyPrefix: string;
}

/**
 * Revoke an API key
 * DELETE /api-keys/:keyPrefix
 */
export async function revokeApiKey(
  keyPrefix: string
): Promise<RevokeApiKeyResponse> {
  return apiFetch<RevokeApiKeyResponse>(`/api-keys/${keyPrefix}`, {
    method: 'DELETE',
  });
}

export interface RotateApiKeyResponse {
  apiKey: string;
  name: string;
  message: string;
  warning: string;
}

/**
 * Rotate an API key (create new and keep old)
 * POST /api-keys/:keyPrefix/rotate
 */
export async function rotateApiKey(
  keyPrefix: string
): Promise<RotateApiKeyResponse> {
  return apiFetch<RotateApiKeyResponse>(`/api-keys/${keyPrefix}/rotate`, {
    method: 'POST',
  });
}
