# React Query Setup for 402pay Dashboard

This directory contains the complete React Query setup for data fetching and state management in the 402pay dashboard.

## Files Overview

### `api-client.ts`
Core API client that provides typed functions for all facilitator backend endpoints.

**Features:**
- Base fetch wrapper with error handling
- Typed error responses with `ApiClientError`
- Automatic JSON serialization
- Configurable base URL via `NEXT_PUBLIC_FACILITATOR_URL` environment variable

**API Functions:**
- **Payment Verification:** `verifyPayment(proof)`
- **Analytics:**
  - `getTransactions(params?)` - Fetch transactions with filters
  - `getRevenue(period)` - Revenue analytics by period
  - `getTopAgents(limit)` - Top spending agents
  - `getAnalyticsEvents(params)` - Analytics events
- **Subscriptions:**
  - `getSubscriptions(params?)` - List all subscriptions
  - `getSubscription(id)` - Get single subscription
  - `createSubscription(data)` - Create new subscription
  - `cancelSubscription(id, cancelAtPeriodEnd)` - Cancel subscription
  - `getSubscriptionPlans()` - Available plans
- **Agent Wallets:**
  - `getAgents(params?)` - List all agents
  - `getAgent(id)` - Get single agent
  - `createAgent(data)` - Create new agent
  - `updateAgent(id, data)` - Update agent
  - `deleteAgent(id)` - Delete agent
  - `getAgentReputation(id)` - Get agent reputation data

### `queries.ts`
Custom React Query hooks that wrap the API client functions.

**Features:**
- Centralized query key factory for consistent caching
- Pre-configured stale times and cache times
- Automatic cache invalidation on mutations
- Optimistic updates for better UX
- Proper TypeScript typing throughout

**Query Hooks:**
```tsx
useTransactions(params?, options?)
useRevenue(period, options?)
useTopAgents(limit?, options?)
useAnalyticsEvents(params?, options?)
useSubscriptions(params?, options?)
useSubscription(id, options?)
useSubscriptionPlans(options?)
useAgents(params?, options?)
useAgent(id, options?)
useAgentReputation(id, options?)
```

**Mutation Hooks:**
```tsx
useVerifyPayment(options?)
useCreateSubscription(options?)
useCancelSubscription(options?)
useCreateAgent(options?)
useUpdateAgent(options?)
useDeleteAgent(options?)
```

**Helper Hooks:**
```tsx
usePrefetchTransactions() - Prefetch transactions for instant loading
usePrefetchAgent() - Prefetch agent details
useInvalidateAll() - Manual cache invalidation
```

### `query-provider.tsx`
React Query provider configuration.

**Features:**
- Pre-configured QueryClient with optimized defaults
- Smart retry logic (no retries on 4xx errors)
- Exponential backoff for retries
- React Query DevTools in development mode
- SSR-compatible setup

**Configuration:**
- `staleTime`: 30 seconds
- `gcTime`: 5 minutes
- `retry`: Up to 2 times (not on 4xx errors)
- `refetchOnWindowFocus`: Production only
- `refetchOnReconnect`: Always

## Usage Examples

### Basic Query

```tsx
'use client';

import { useTransactions } from '@/lib/queries';

export function TransactionsList() {
  const { data, isLoading, error } = useTransactions({
    limit: 10,
    status: 'confirmed'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.transactions.map(tx => (
        <li key={tx.id}>{tx.amount} {tx.currency}</li>
      ))}
    </ul>
  );
}
```

### Query with Parameters

```tsx
'use client';

import { useState } from 'react';
import { useRevenue } from '@/lib/queries';

export function RevenueChart() {
  const [period, setPeriod] = useState<'month'>('month');
  const { data } = useRevenue(period);

  return (
    <div>
      <select value={period} onChange={e => setPeriod(e.target.value)}>
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      <p>Total: {data?.total} {data?.currency}</p>
    </div>
  );
}
```

### Mutations

```tsx
'use client';

import { useCreateAgent } from '@/lib/queries';

export function CreateAgentForm() {
  const createAgent = useCreateAgent({
    onSuccess: (agent) => {
      console.log('Created:', agent);
    },
    onError: (error) => {
      console.error('Error:', error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgent.mutate({
      name: 'My Agent',
      publicKey: 'Abc...',
      owner: 'Xyz...'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={createAgent.isPending}>
        {createAgent.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
'use client';

import { useUpdateAgent } from '@/lib/queries';

export function UpdateAgentName({ agentId }: { agentId: string }) {
  const updateAgent = useUpdateAgent();

  const handleUpdate = () => {
    updateAgent.mutate({
      id: agentId,
      data: { name: 'New Name' }
    });
    // UI updates immediately, rolls back on error
  };

  return <button onClick={handleUpdate}>Update Name</button>;
}
```

### Multiple Queries

```tsx
'use client';

import { useRevenue, useTopAgents, useSubscriptions } from '@/lib/queries';

export function Dashboard() {
  const revenue = useRevenue('month');
  const topAgents = useTopAgents(5);
  const subscriptions = useSubscriptions({ status: 'active' });

  const isLoading = revenue.isLoading || topAgents.isLoading || subscriptions.isLoading;

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <p>Revenue: {revenue.data?.total}</p>
      <p>Top Agents: {topAgents.data?.agents.length}</p>
      <p>Subscriptions: {subscriptions.data?.total}</p>
    </div>
  );
}
```

### Error Handling

```tsx
'use client';

import { useAgents } from '@/lib/queries';
import { ApiClientError } from '@/lib/api-client';

export function AgentsList() {
  const { data, error, isError } = useAgents();

  if (isError) {
    return (
      <div>
        <h3>Error loading agents</h3>
        <p>Status: {error.statusCode}</p>
        <p>Message: {error.message}</p>
      </div>
    );
  }

  return <ul>{/* render agents */}</ul>;
}
```

### Pagination

```tsx
'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/queries';

export function PaginatedList() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data } = useTransactions({
    limit,
    offset: page * limit
  });

  return (
    <div>
      <ul>{/* render items */}</ul>
      <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

### Prefetching

```tsx
'use client';

import { usePrefetchAgent } from '@/lib/queries';

export function AgentCard({ agentId }: { agentId: string }) {
  const prefetch = usePrefetchAgent();

  return (
    <div
      onMouseEnter={() => prefetch(agentId)}
      onClick={() => navigate(`/agents/${agentId}`)}
    >
      Agent {agentId}
    </div>
  );
}
```

## Environment Variables

Create a `.env.local` file in the dashboard app root:

```env
# Facilitator API URL (defaults to http://localhost:3001)
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:3001

# For production
# NEXT_PUBLIC_FACILITATOR_URL=https://api.402pay.com
```

## Query Keys

All query keys are managed through the `queryKeys` factory in `queries.ts`:

```tsx
queryKeys.transactions(params?)
queryKeys.revenue(period)
queryKeys.topAgents(limit?)
queryKeys.analyticsEvents(params?)
queryKeys.subscriptions(params?)
queryKeys.subscription(id)
queryKeys.subscriptionPlans()
queryKeys.agents(params?)
queryKeys.agent(id)
queryKeys.agentReputation(id)
```

This ensures consistent cache keys across the application.

## Cache Invalidation

Mutations automatically invalidate related queries:

- `useCreateAgent` → invalidates `agents` list
- `useUpdateAgent` → invalidates `agents` list + optimistic update
- `useDeleteAgent` → removes from cache + invalidates lists
- `useCreateSubscription` → invalidates `subscriptions` list
- `useCancelSubscription` → updates subscription + invalidates lists
- `useVerifyPayment` → invalidates transactions and analytics

## TypeScript Support

All functions and hooks are fully typed:

```tsx
import type { Transaction, AgentWallet } from '@402pay/shared';
import type { ApiClientError } from '@/lib/api-client';

// Type-safe queries
const { data } = useTransactions(); // data is TransactionsResponse | undefined
const { error } = useAgents(); // error is ApiClientError | null

// Type-safe mutations
const createAgent = useCreateAgent();
createAgent.mutate({
  name: 'Agent',
  publicKey: 'key',
  owner: 'owner'
  // TypeScript will enforce correct shape
});
```

## Best Practices

1. **Use Query Options**: Pass options to customize behavior per component
2. **Handle Loading States**: Always show loading UI for better UX
3. **Handle Errors**: Display error messages to users
4. **Optimistic Updates**: Use for instant feedback on mutations
5. **Prefetching**: Prefetch data on hover/focus for instant navigation
6. **Query Keys**: Use the factory to ensure consistent cache keys
7. **Stale Time**: Adjust per query based on data freshness needs
8. **Pagination**: Use offset/limit parameters for large datasets

## React Query DevTools

In development mode, the DevTools are available at the bottom-left of your screen. Use them to:

- Inspect query states and cached data
- Debug refetch behavior
- View query timings
- Manually trigger refetches
- Clear cache

## Testing

When testing components that use these hooks, use `@tanstack/react-query` testing utilities:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

test('renders transactions', async () => {
  const queryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <TransactionsList />
    </QueryClientProvider>
  );

  expect(await screen.findByText(/transaction/i)).toBeInTheDocument();
});
```

## Further Reading

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/devtools)
- [Query Keys Best Practices](https://tanstack.com/query/latest/docs/guides/query-keys)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/guides/optimistic-updates)
