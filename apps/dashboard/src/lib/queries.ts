/**
 * React Query Hooks for 402pay Dashboard
 *
 * Custom hooks using @tanstack/react-query for data fetching,
 * caching, and state management.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type {
  PaymentProof,
  TokenType,
  Subscription,
  AgentWallet
} from '@402pay/shared';
import * as api from './api-client';

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Centralized query key factory for consistent cache keys
 */
export const queryKeys = {
  // Analytics
  transactions: (params?: api.TransactionQueryParams) =>
    ['transactions', params] as const,
  revenue: (period: 'day' | 'week' | 'month' | 'year') =>
    ['revenue', period] as const,
  topAgents: (limit?: number) => ['topAgents', limit] as const,
  analyticsEvents: (
    params?: Parameters<typeof api.getAnalyticsEvents>[0]
  ) => ['analyticsEvents', params] as const,

  // Subscriptions
  subscriptions: (params?: Parameters<typeof api.getSubscriptions>[0]) =>
    ['subscriptions', params] as const,
  subscription: (id: string) => ['subscription', id] as const,
  subscriptionPlans: () => ['subscriptionPlans'] as const,

  // Agents
  agents: (params?: Parameters<typeof api.getAgents>[0]) =>
    ['agents', params] as const,
  agent: (id: string) => ['agent', id] as const,
  agentReputation: (id: string) => ['agentReputation', id] as const,
};

// ============================================================================
// Analytics Hooks
// ============================================================================

/**
 * Fetch transactions with optional filters
 */
export function useTransactions(
  params?: api.TransactionQueryParams,
  options?: Omit<
    UseQueryOptions<api.TransactionsResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => api.getTransactions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Fetch revenue analytics
 */
export function useRevenue(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  options?: Omit<
    UseQueryOptions<api.RevenueData, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.revenue(period),
    queryFn: () => api.getRevenue(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}

/**
 * Fetch top agents by spending
 */
export function useTopAgents(
  limit: number = 10,
  options?: Omit<
    UseQueryOptions<api.TopAgentsResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.topAgents(limit),
    queryFn: () => api.getTopAgents(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
}

/**
 * Fetch analytics events
 */
export function useAnalyticsEvents(
  params?: Parameters<typeof api.getAnalyticsEvents>[0],
  options?: Omit<
    UseQueryOptions<api.AnalyticsEventsResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.analyticsEvents(params),
    queryFn: () => api.getAnalyticsEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// ============================================================================
// Payment Verification Hooks
// ============================================================================

/**
 * Verify a payment proof
 */
export function useVerifyPayment(
  options?: UseMutationOptions<
    api.VerifyPaymentResponse,
    api.ApiClientError,
    PaymentProof
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proof: PaymentProof) => api.verifyPayment(proof),
    onSuccess: (data) => {
      // Invalidate transactions to refetch updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(),
      });

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: queryKeys.revenue('month'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.analyticsEvents(),
      });
    },
    ...options,
  });
}

// ============================================================================
// Subscription Hooks
// ============================================================================

/**
 * Fetch all subscriptions
 */
export function useSubscriptions(
  params?: Parameters<typeof api.getSubscriptions>[0],
  options?: Omit<
    UseQueryOptions<api.SubscriptionsResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.subscriptions(params),
    queryFn: () => api.getSubscriptions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Fetch a single subscription
 */
export function useSubscription(
  id: string,
  options?: Omit<
    UseQueryOptions<Subscription, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.subscription(id),
    queryFn: () => api.getSubscription(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Fetch subscription plans
 */
export function useSubscriptionPlans(
  options?: Omit<
    UseQueryOptions<api.SubscriptionPlansResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans(),
    queryFn: () => api.getSubscriptionPlans(),
    staleTime: 1000 * 60 * 30, // 30 minutes (plans don't change often)
    ...options,
  });
}

/**
 * Create a new subscription
 */
export function useCreateSubscription(
  options?: UseMutationOptions<
    Subscription,
    api.ApiClientError,
    api.CreateSubscriptionData
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: api.CreateSubscriptionData) =>
      api.createSubscription(data),
    onSuccess: (newSubscription) => {
      // Invalidate subscriptions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions(),
      });

      // Add the new subscription to the cache
      queryClient.setQueryData(
        queryKeys.subscription(newSubscription.id),
        newSubscription
      );

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: queryKeys.analyticsEvents(),
      });
    },
    ...options,
  });
}

/**
 * Cancel a subscription
 */
export function useCancelSubscription(
  options?: UseMutationOptions<
    api.CancelSubscriptionResponse,
    api.ApiClientError,
    { id: string; cancelAtPeriodEnd?: boolean }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cancelAtPeriodEnd = true }) =>
      api.cancelSubscription(id, cancelAtPeriodEnd),
    onSuccess: (data, variables) => {
      // Update the specific subscription in cache
      queryClient.setQueryData(
        queryKeys.subscription(variables.id),
        data.subscription
      );

      // Invalidate subscriptions list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions(),
      });

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: queryKeys.analyticsEvents(),
      });
    },
    ...options,
  });
}

// ============================================================================
// Agent Wallet Hooks
// ============================================================================

/**
 * Fetch all agent wallets
 */
export function useAgents(
  params?: Parameters<typeof api.getAgents>[0],
  options?: Omit<
    UseQueryOptions<api.AgentsResponse, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.agents(params),
    queryFn: () => api.getAgents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Fetch a single agent wallet
 */
export function useAgent(
  id: string,
  options?: Omit<
    UseQueryOptions<AgentWallet, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.agent(id),
    queryFn: () => api.getAgent(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Fetch agent reputation
 */
export function useAgentReputation(
  id: string,
  options?: Omit<
    UseQueryOptions<api.AgentReputation, api.ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.agentReputation(id),
    queryFn: () => api.getAgentReputation(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Create a new agent wallet
 */
export function useCreateAgent(
  options?: UseMutationOptions<
    AgentWallet,
    api.ApiClientError,
    api.CreateAgentData
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: api.CreateAgentData) => api.createAgent(data),
    onSuccess: (newAgent) => {
      // Invalidate agents list
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents(),
      });

      // Add the new agent to the cache
      queryClient.setQueryData(queryKeys.agent(newAgent.id), newAgent);
    },
    ...options,
  });
}

/**
 * Update an agent wallet with optimistic updates
 */
export function useUpdateAgent(
  options?: UseMutationOptions<
    AgentWallet,
    api.ApiClientError,
    { id: string; data: api.UpdateAgentData },
    { previousAgent: AgentWallet | undefined }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateAgent(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.agent(id) });

      // Snapshot previous value
      const previousAgent = queryClient.getQueryData<AgentWallet>(queryKeys.agent(id));

      // Optimistically update
      if (previousAgent) {
        queryClient.setQueryData<AgentWallet>(queryKeys.agent(id), {
          ...previousAgent,
          ...data,
        });
      }

      return { previousAgent };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAgent) {
        queryClient.setQueryData(
          queryKeys.agent(variables.id),
          context.previousAgent
        );
      }
    },
    onSuccess: (updatedAgent, variables) => {
      // Update the agent in cache
      queryClient.setQueryData(queryKeys.agent(variables.id), updatedAgent);

      // Invalidate agents list
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents(),
      });
    },
    ...options,
  });
}

/**
 * Delete an agent wallet
 */
export function useDeleteAgent(
  options?: UseMutationOptions<void, api.ApiClientError, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteAgent(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.agent(id) });
      queryClient.removeQueries({ queryKey: queryKeys.agentReputation(id) });

      // Invalidate agents list
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents(),
      });

      // Invalidate analytics that might reference this agent
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topAgents(),
      });
    },
    ...options,
  });
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Prefetch transactions for better UX
 */
export function usePrefetchTransactions() {
  const queryClient = useQueryClient();

  return (params?: api.TransactionQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.transactions(params),
      queryFn: () => api.getTransactions(params),
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Prefetch agent details for better UX
 */
export function usePrefetchAgent() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.agent(id),
      queryFn: () => api.getAgent(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Invalidate all queries - useful for manual refresh
 */
export function useInvalidateAll() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries();
  };
}
