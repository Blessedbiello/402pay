# React Query Quick Reference - 402pay Dashboard

## Import Hooks

```tsx
import {
  // Analytics
  useTransactions,
  useRevenue,
  useTopAgents,
  useAnalyticsEvents,

  // Subscriptions
  useSubscriptions,
  useSubscription,
  useSubscriptionPlans,
  useCreateSubscription,
  useCancelSubscription,

  // Agents
  useAgents,
  useAgent,
  useAgentReputation,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,

  // Payments
  useVerifyPayment,

  // Helpers
  usePrefetchTransactions,
  usePrefetchAgent,
  useInvalidateAll,
} from '@/lib/queries';
```

## Common Patterns

### Query Pattern
```tsx
const { data, isLoading, error, refetch } = useTransactions({
  limit: 10,
  status: 'confirmed'
});
```

### Mutation Pattern
```tsx
const createAgent = useCreateAgent({
  onSuccess: (data) => console.log('Created:', data),
  onError: (error) => console.error('Error:', error.message)
});

createAgent.mutate({ name, publicKey, owner });
```

### Loading State
```tsx
if (isLoading) return <Skeleton />;
if (error) return <Error message={error.message} />;
return <Data data={data} />;
```

### Mutation State
```tsx
<button
  onClick={() => mutation.mutate(data)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Saving...' : 'Save'}
</button>
```

## All Hooks Reference

### Analytics
```tsx
// Transactions with filters
useTransactions({
  limit: 20,
  offset: 0,
  status: 'confirmed',
  agentId: '...',
  currency: 'USDC',
  startDate: timestamp,
  endDate: timestamp
})

// Revenue analytics
useRevenue('month') // 'day' | 'week' | 'month' | 'year'

// Top agents
useTopAgents(10) // limit

// Analytics events
useAnalyticsEvents({
  type: 'payment',
  agentId: '...',
  limit: 50
})
```

### Subscriptions
```tsx
// List subscriptions
useSubscriptions({ status: 'active', agentId: '...' })

// Single subscription
useSubscription(subscriptionId)

// Subscription plans
useSubscriptionPlans()

// Create subscription
const create = useCreateSubscription();
create.mutate({ planId, agentId, walletAddress })

// Cancel subscription
const cancel = useCancelSubscription();
cancel.mutate({ id, cancelAtPeriodEnd: true })
```

### Agent Wallets
```tsx
// List agents
useAgents({ limit: 20, offset: 0, owner: '...' })

// Single agent
useAgent(agentId)

// Agent reputation
useAgentReputation(agentId)

// Create agent
const create = useCreateAgent();
create.mutate({
  name: 'My Agent',
  publicKey: '...',
  owner: '...',
  spendingLimit: { daily: 1000, perTransaction: 100 },
  allowedServices: ['/api/v1/*']
})

// Update agent
const update = useUpdateAgent();
update.mutate({
  id: agentId,
  data: { name: 'New Name', spendingLimit: { daily: 2000 } }
})

// Delete agent
const remove = useDeleteAgent();
remove.mutate(agentId)
```

### Payment Verification
```tsx
const verify = useVerifyPayment();
verify.mutate({
  signature: '...',
  payer: '...',
  amount: 100,
  currency: 'USDC',
  nonce: '...',
  timestamp: Date.now()
})
```

### Helpers
```tsx
// Prefetch on hover
const prefetchAgent = usePrefetchAgent();
<div onMouseEnter={() => prefetchAgent(agentId)}>...</div>

// Manual refresh
const invalidateAll = useInvalidateAll();
<button onClick={invalidateAll}>Refresh All</button>
```

## Query Options

All query hooks accept an options parameter:

```tsx
useTransactions(params, {
  enabled: true,              // Enable/disable query
  staleTime: 1000 * 60 * 5,   // Override default stale time
  refetchInterval: 10000,      // Poll every 10 seconds
  refetchOnWindowFocus: true,  // Refetch on window focus
  onSuccess: (data) => {},     // Success callback
  onError: (error) => {},      // Error callback
  select: (data) => data.transactions, // Transform data
})
```

## Mutation Options

All mutation hooks accept an options parameter:

```tsx
useCreateAgent({
  onMutate: () => {},          // Before mutation starts
  onSuccess: (data) => {},     // On success
  onError: (error) => {},      // On error
  onSettled: () => {},         // After success or error
})
```

## Error Handling

```tsx
import { ApiClientError } from '@/lib/api-client';

const { error } = useAgents();

if (error) {
  console.log(error.statusCode);  // 404, 500, etc.
  console.log(error.message);     // "Not found"
  console.log(error.details);     // Additional info
}
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:3001

# Production
NEXT_PUBLIC_FACILITATOR_URL=https://api.402pay.com
```

## React Query DevTools

DevTools are automatically enabled in development mode.

Access at bottom-left corner of your browser.

## File Locations

- API Client: `/src/lib/api-client.ts`
- Query Hooks: `/src/lib/queries.ts`
- Provider: `/src/providers/query-provider.tsx`
- Types: `@402pay/shared`

## Quick Start

1. Import a hook
2. Use it in your component
3. Handle loading/error states
4. Render data

```tsx
'use client';

import { useAgents } from '@/lib/queries';

export function AgentsList() {
  const { data, isLoading, error } = useAgents();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.agents.map(agent => (
        <li key={agent.id}>{agent.name}</li>
      ))}
    </ul>
  );
}
```

---

For more details, see:
- `REACT_QUERY_SETUP.md` - Complete setup guide
- `src/lib/README.md` - Full documentation with examples
- `src/lib/example-usage.tsx` - 10 real-world examples
