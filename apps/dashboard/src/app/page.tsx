'use client';

import { useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import TransactionList from '@/components/TransactionList';
import RevenueChart from '@/components/RevenueChart';
import {
  useRevenue,
  useTransactions,
  useSubscriptions,
  useAgents,
} from '@/lib/queries';
import type { Transaction } from '@402pay/shared';

/**
 * Skeleton loader component for stats cards
 */
function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>
  );
}

/**
 * Error display component with retry button
 */
function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400 dark:text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
            Failed to load data
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

/**
 * Transform Transaction type to match TransactionList component expectations
 */
function transformTransaction(tx: Transaction): {
  id: string;
  resource: string;
  amount: number;
  currency: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  agentId: string;
} {
  return {
    id: tx.id,
    resource: tx.resource,
    amount: tx.amount,
    currency: tx.currency,
    timestamp: tx.timestamp,
    status: tx.status,
    agentId: tx.agentId || 'unknown',
  };
}

/**
 * Calculate percentage change (mocked for now until we have historical data)
 */
function calculateTrend(current: number): { value: string; isUp: boolean } {
  // TODO: Replace with real calculation from historical data
  const mockChange = Math.random() * 20 - 5; // -5% to +15%
  return {
    value: `${mockChange > 0 ? '+' : ''}${mockChange.toFixed(1)}%`,
    isUp: mockChange > 0,
  };
}

export default function Dashboard() {
  // Fetch data using React Query hooks
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue,
  } = useRevenue('week');

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions({ limit: 10 });

  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions({ status: 'active' });

  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
  } = useAgents();

  // Calculate derived stats from real data
  const stats = useMemo(() => {
    // Revenue stats
    const totalRevenue = revenueData?.total || 0;
    const todayRevenue =
      revenueData?.breakdown?.[revenueData.breakdown.length - 1]?.amount || 0;

    // Calculate monthly revenue from weekly data (estimate)
    const monthlyRevenue = totalRevenue * 4.33; // Average weeks per month

    // Transaction counts
    const totalTransactions = transactionsData?.total || 0;
    const todayTransactions =
      transactionsData?.transactions?.filter((tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tx.timestamp >= today.getTime();
      }).length || 0;

    // Subscriptions
    const activeSubscriptions = subscriptionsData?.total || 0;

    // Agents
    const activeAgents = agentsData?.total || 0;

    return {
      revenue: {
        today: todayRevenue,
        week: totalRevenue,
        month: monthlyRevenue,
      },
      transactions: {
        today: todayTransactions,
        total: totalTransactions,
      },
      activeSubscriptions,
      activeAgents,
    };
  }, [revenueData, transactionsData, subscriptionsData, agentsData]);

  // Calculate trends
  const revenueTrend = useMemo(() => calculateTrend(stats.revenue.today), [stats.revenue.today]);
  const transactionsTrend = useMemo(() => calculateTrend(stats.transactions.today), [stats.transactions.today]);
  const subscriptionsTrend = useMemo(() => calculateTrend(stats.activeSubscriptions), [stats.activeSubscriptions]);
  const agentsTrend = useMemo(() => calculateTrend(stats.activeAgents), [stats.activeAgents]);

  // Transform transactions for the TransactionList component
  const transformedTransactions = useMemo(
    () =>
      transactionsData?.transactions?.map(transformTransaction) || [],
    [transactionsData]
  );

  // Calculate success rate
  const successRate = useMemo(() => {
    if (!transactionsData?.transactions?.length) return 0;
    const confirmed = transactionsData.transactions.filter(
      (tx) => tx.status === 'confirmed'
    ).length;
    return (confirmed / transactionsData.transactions.length) * 100;
  }, [transactionsData]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your x402 payments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Today */}
          {revenueLoading ? (
            <StatsCardSkeleton />
          ) : revenueError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <ErrorDisplay
                message="Failed to load revenue data"
                onRetry={() => refetchRevenue()}
              />
            </div>
          ) : (
            <StatsCard
              title="Revenue Today"
              value={`$${stats.revenue.today.toFixed(2)}`}
              subtitle={`$${stats.revenue.month.toFixed(2)} this month`}
              trend={revenueTrend.value}
              trendUp={revenueTrend.isUp}
            />
          )}

          {/* Transactions */}
          {transactionsLoading ? (
            <StatsCardSkeleton />
          ) : transactionsError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <ErrorDisplay
                message="Failed to load transactions"
                onRetry={() => refetchTransactions()}
              />
            </div>
          ) : (
            <StatsCard
              title="Transactions"
              value={stats.transactions.today.toString()}
              subtitle={`${stats.transactions.total.toLocaleString()} total • ${successRate.toFixed(1)}% success`}
              trend={transactionsTrend.value}
              trendUp={transactionsTrend.isUp}
            />
          )}

          {/* Active Subscriptions */}
          {subscriptionsLoading ? (
            <StatsCardSkeleton />
          ) : subscriptionsError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <ErrorDisplay message="Failed to load subscriptions" />
            </div>
          ) : (
            <StatsCard
              title="Active Subscriptions"
              value={stats.activeSubscriptions.toString()}
              subtitle={`Across ${stats.activeAgents} agents`}
              trend={subscriptionsTrend.value}
              trendUp={subscriptionsTrend.isUp}
            />
          )}

          {/* Active Agents */}
          {agentsLoading ? (
            <StatsCardSkeleton />
          ) : agentsError ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <ErrorDisplay message="Failed to load agents" />
            </div>
          ) : (
            <StatsCard
              title="Active Agents"
              value={stats.activeAgents.toString()}
              subtitle={`${stats.transactions.total} transactions`}
              trend={agentsTrend.value}
              trendUp={agentsTrend.isUp}
            />
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Revenue Overview
          </h2>
          {revenueLoading ? (
            <div className="h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : revenueError ? (
            <ErrorDisplay
              message="Failed to load revenue chart"
              onRetry={() => refetchRevenue()}
            />
          ) : !revenueData?.breakdown?.length ? (
            <EmptyState message="No revenue data available yet" />
          ) : (
            <RevenueChart data={revenueData.breakdown} />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recent Transactions
              </h2>
              {transactionsData && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {transformedTransactions.length} of{' '}
                  {transactionsData.total}
                </span>
              )}
            </div>
          </div>
          {transactionsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ) : transactionsError ? (
            <div className="p-6">
              <ErrorDisplay
                message="Failed to load transactions"
                onRetry={() => refetchTransactions()}
              />
            </div>
          ) : transformedTransactions.length === 0 ? (
            <EmptyState message="No transactions yet" />
          ) : (
            <TransactionList transactions={transformedTransactions} />
          )}
        </div>
      </main>
    </div>
  );
}
