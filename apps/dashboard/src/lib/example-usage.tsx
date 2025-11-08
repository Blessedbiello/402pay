/**
 * Example Usage of React Query Hooks
 *
 * This file demonstrates how to use the custom React Query hooks
 * in your components. Remove this file once you're familiar with the patterns.
 */

'use client';

import { useState } from 'react';
import {
  useTransactions,
  useRevenue,
  useTopAgents,
  useAgents,
  useAgent,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useSubscriptions,
  useCreateSubscription,
  useCancelSubscription,
  useVerifyPayment,
} from './queries';
import type { PaymentProof } from '@402pay/shared';

// ============================================================================
// Example 1: Basic Query Usage
// ============================================================================

export function TransactionsList() {
  const { data, isLoading, error, refetch } = useTransactions({
    limit: 10,
    status: 'confirmed',
  });

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Recent Transactions ({data?.total})</h2>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.transactions.map((tx) => (
          <li key={tx.id}>
            {tx.amount} {tx.currency} - {tx.resource}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 2: Query with Parameters
// ============================================================================

export function RevenueChart() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const { data, isLoading } = useRevenue(period);

  return (
    <div>
      <h2>Revenue Analytics</h2>
      <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Total: {data?.total} {data?.currency}</p>
          <ul>
            {data?.breakdown.map((item) => (
              <li key={item.date}>
                {item.date}: {item.amount} ({item.transactionCount} transactions)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Mutations - Creating Resources
// ============================================================================

export function CreateAgentForm() {
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [owner, setOwner] = useState('');

  const createAgent = useCreateAgent({
    onSuccess: (newAgent) => {
      console.log('Agent created:', newAgent);
      alert(`Agent ${newAgent.name} created successfully!`);
      // Reset form
      setName('');
      setPublicKey('');
      setOwner('');
    },
    onError: (error) => {
      alert(`Error creating agent: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgent.mutate({
      name,
      publicKey,
      owner,
      spendingLimit: {
        daily: 1000,
        perTransaction: 100,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Agent Wallet</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Agent Name"
        required
      />
      <input
        type="text"
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        placeholder="Public Key"
        required
      />
      <input
        type="text"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        placeholder="Owner Address"
        required
      />
      <button type="submit" disabled={createAgent.isPending}>
        {createAgent.isPending ? 'Creating...' : 'Create Agent'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 4: Mutations - Updating Resources
// ============================================================================

export function UpdateAgentSpendingLimit({ agentId }: { agentId: string }) {
  const [dailyLimit, setDailyLimit] = useState(1000);
  const { data: agent } = useAgent(agentId);

  const updateAgent = useUpdateAgent({
    onSuccess: () => {
      alert('Spending limit updated!');
    },
  });

  const handleUpdate = () => {
    updateAgent.mutate({
      id: agentId,
      data: {
        spendingLimit: {
          daily: dailyLimit,
          perTransaction: agent?.spendingLimit?.perTransaction,
        },
      },
    });
  };

  return (
    <div>
      <h3>Update Spending Limit for {agent?.name}</h3>
      <input
        type="number"
        value={dailyLimit}
        onChange={(e) => setDailyLimit(Number(e.target.value))}
      />
      <button onClick={handleUpdate} disabled={updateAgent.isPending}>
        Update
      </button>
    </div>
  );
}

// ============================================================================
// Example 5: Mutations - Deleting Resources
// ============================================================================

export function DeleteAgentButton({ agentId }: { agentId: string }) {
  const deleteAgent = useDeleteAgent({
    onSuccess: () => {
      alert('Agent deleted successfully!');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgent.mutate(agentId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteAgent.isPending}>
      {deleteAgent.isPending ? 'Deleting...' : 'Delete Agent'}
    </button>
  );
}

// ============================================================================
// Example 6: Multiple Queries in One Component
// ============================================================================

export function Dashboard() {
  const { data: revenue } = useRevenue('month');
  const { data: topAgents } = useTopAgents(5);
  const { data: subscriptions } = useSubscriptions({ status: 'active' });

  return (
    <div>
      <h1>Dashboard Overview</h1>

      <section>
        <h2>Monthly Revenue</h2>
        <p>{revenue?.total} {revenue?.currency}</p>
      </section>

      <section>
        <h2>Top Agents</h2>
        <ul>
          {topAgents?.agents.map((agent) => (
            <li key={agent.agentId}>
              {agent.agentName}: ${agent.totalSpent}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Active Subscriptions</h2>
        <p>{subscriptions?.total} active subscriptions</p>
      </section>
    </div>
  );
}

// ============================================================================
// Example 7: Payment Verification
// ============================================================================

export function VerifyPaymentButton({ proof }: { proof: PaymentProof }) {
  const verifyPayment = useVerifyPayment({
    onSuccess: (result) => {
      if (result.verified) {
        alert('Payment verified! Access granted.');
      } else {
        alert('Payment verification failed.');
      }
    },
  });

  return (
    <button
      onClick={() => verifyPayment.mutate(proof)}
      disabled={verifyPayment.isPending}
    >
      {verifyPayment.isPending ? 'Verifying...' : 'Verify Payment'}
    </button>
  );
}

// ============================================================================
// Example 8: Subscription Management
// ============================================================================

export function SubscriptionManager({ agentId }: { agentId: string }) {
  const { data: subscriptions } = useSubscriptions({ agentId });
  const cancelSubscription = useCancelSubscription();

  const handleCancel = (subscriptionId: string) => {
    if (confirm('Cancel this subscription?')) {
      cancelSubscription.mutate({
        id: subscriptionId,
        cancelAtPeriodEnd: true,
      });
    }
  };

  return (
    <div>
      <h2>Agent Subscriptions</h2>
      {subscriptions?.subscriptions.map((sub) => (
        <div key={sub.id}>
          <p>Plan: {sub.planId}</p>
          <p>Status: {sub.status}</p>
          {sub.status === 'active' && (
            <button onClick={() => handleCancel(sub.id)}>
              Cancel Subscription
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 9: Error Handling
// ============================================================================

export function AgentsListWithErrorHandling() {
  const { data, isLoading, error, isError } = useAgents();

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  if (isError) {
    return (
      <div>
        <h3>Error loading agents</h3>
        <p>Status: {error.statusCode}</p>
        <p>Message: {error.message}</p>
        {error.details ? <pre>{JSON.stringify(error.details, null, 2)}</pre> : null}
      </div>
    );
  }

  return (
    <div>
      <h2>Agents ({data?.total})</h2>
      <ul>
        {data?.agents.map((agent) => (
          <li key={agent.id}>
            {agent.name} - {agent.publicKey}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 10: Pagination
// ============================================================================

export function PaginatedTransactions() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useTransactions({
    limit,
    offset: page * limit,
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div>
      <h2>Transactions</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data?.transactions.map((tx) => (
              <li key={tx.id}>
                {tx.amount} {tx.currency}
              </li>
            ))}
          </ul>
          <div>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
