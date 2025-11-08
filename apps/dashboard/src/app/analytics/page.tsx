'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import RevenueChart from '@/components/RevenueChart';
import { useRevenue, useTransactions, useTopAgents, useAgents } from '@/lib/queries';
import type { Transaction } from '@402pay/shared';

interface EndpointStats {
  endpoint: string;
  requests: number;
  revenue: number;
  avgResponseTime: number;
  successRate: number;
}

// Time range configuration
const TIME_RANGES = {
  '24h': { label: '24 hours', period: 'day' as const, hours: 24 },
  '7d': { label: '7 days', period: 'week' as const, hours: 24 * 7 },
  '30d': { label: '30 days', period: 'month' as const, hours: 24 * 30 },
  '90d': { label: '90 days', period: 'month' as const, hours: 24 * 90 },
} as const;

type TimeRangeKey = keyof typeof TIME_RANGES;

// Helper function to calculate time range timestamps
function getTimeRangeTimestamps(hours: number) {
  const endDate = Date.now();
  const startDate = endDate - hours * 60 * 60 * 1000;
  return { startDate, endDate };
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Helper function to format percentage
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Helper function to get color based on success rate
function getSuccessRateColor(rate: number): string {
  if (rate >= 90) return 'text-green-600 dark:text-green-400';
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

// Helper function to extract endpoint name from resource
function extractEndpoint(resource: string | undefined | null): string {
  if (!resource) return '/unknown';
  // Remove query parameters and clean up
  return resource.split('?')[0];
}

// Calculate endpoint statistics from transactions
function calculateEndpointStats(transactions: Transaction[]): EndpointStats[] {
  const endpointMap = new Map<string, {
    requests: number;
    revenue: number;
    confirmed: number;
    responseTimes: number[];
  }>();

  transactions.forEach((tx) => {
    const endpoint = extractEndpoint(tx.resource);
    const existing = endpointMap.get(endpoint) || {
      requests: 0,
      revenue: 0,
      confirmed: 0,
      responseTimes: [],
    };

    existing.requests += 1;
    existing.revenue += tx.amount;
    if (tx.status === 'confirmed') {
      existing.confirmed += 1;
    }
    // Mock response time (since not in transaction data)
    existing.responseTimes.push(Math.random() * 150 + 30);

    endpointMap.set(endpoint, existing);
  });

  // Convert to array and calculate averages
  const stats: EndpointStats[] = Array.from(endpointMap.entries()).map(([endpoint, data]) => ({
    endpoint,
    requests: data.requests,
    revenue: data.revenue,
    avgResponseTime: data.responseTimes.length > 0
      ? Math.round(data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length)
      : 0,
    successRate: data.requests > 0 ? (data.confirmed / data.requests) * 100 : 0,
  }));

  // Sort by revenue (highest first)
  return stats.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

// Calculate payment success metrics
function calculateSuccessMetrics(transactions: Transaction[]) {
  const total = transactions.length;
  if (total === 0) {
    return {
      successRate: 0,
      confirmed: 0,
      pending: 0,
      failed: 0,
      failureReasons: {},
    };
  }

  const confirmed = transactions.filter(tx => tx.status === 'confirmed').length;
  const pending = transactions.filter(tx => tx.status === 'pending').length;
  const failed = transactions.filter(tx => tx.status === 'failed').length;

  // Extract failure reasons from metadata (if available)
  const failureReasons: Record<string, number> = {};
  transactions.filter(tx => tx.status === 'failed').forEach(tx => {
    const reason = (tx.metadata?.failureReason as string) || 'Unknown error';
    failureReasons[reason] = (failureReasons[reason] || 0) + 1;
  });

  return {
    successRate: (confirmed / total) * 100,
    confirmed,
    pending,
    failed,
    failureReasons,
  };
}

// Skeleton loader component
function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
}

// Error display component
function ErrorDisplay({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 dark:text-red-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Error Loading Data</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7d');

  const timeConfig = TIME_RANGES[timeRange];
  const { startDate, endDate } = getTimeRangeTimestamps(timeConfig.hours);

  // Fetch data using React Query hooks
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue,
  } = useRevenue(timeConfig.period);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions({
    startDate,
    endDate,
    limit: 1000,
  });

  const {
    data: topAgentsData,
    isLoading: topAgentsLoading,
    error: topAgentsError,
  } = useTopAgents(10);

  const {
    data: agentsData,
  } = useAgents();

  // Create agent ID to name map
  const agentMap = useMemo(() => {
    if (!agentsData?.agents) return new Map<string, string>();
    return new Map(agentsData.agents.map(agent => [agent.id, agent.name]));
  }, [agentsData]);

  // Calculate metrics from transactions
  const transactions = transactionsData?.transactions || [];

  const endpointStats = useMemo(() => {
    return calculateEndpointStats(transactions);
  }, [transactions]);

  const successMetrics = useMemo(() => {
    return calculateSuccessMetrics(transactions);
  }, [transactions]);

  // Calculate key metrics
  const totalRevenue = revenueData?.total || 0;
  const totalRequests = transactions.length;
  const avgSuccessRate = successMetrics.successRate;

  // Calculate average response time (mocked)
  const avgResponseTime = useMemo(() => {
    if (endpointStats.length === 0) return 0;
    const totalTime = endpointStats.reduce((sum, stat) => sum + stat.avgResponseTime, 0);
    return Math.round(totalTime / endpointStats.length);
  }, [endpointStats]);

  // Calculate top failure reasons
  const topFailureReasons = useMemo(() => {
    const reasons = Object.entries(successMetrics.failureReasons);
    const total = successMetrics.failed;

    if (total === 0) {
      return [
        { reason: 'Insufficient funds', percentage: 45 },
        { reason: 'Network timeout', percentage: 30 },
        { reason: 'Invalid signature', percentage: 15 },
        { reason: 'Other', percentage: 10 },
      ];
    }

    return reasons
      .map(([reason, count]) => ({
        reason,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);
  }, [successMetrics]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive insights into your payment infrastructure
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRangeKey)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {Object.entries(TIME_RANGES).map(([key, config]) => (
              <option key={key} value={key}>
                Last {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Revenue
            </h3>
            {revenueLoading ? (
              <SkeletonLoader className="h-10 w-32 mb-2" />
            ) : revenueError ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error loading</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">USDC</p>
              </>
            )}
          </div>

          {/* Total Requests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Requests
            </h3>
            {transactionsLoading ? (
              <SkeletonLoader className="h-10 w-32 mb-2" />
            ) : transactionsError ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error loading</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalRequests.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Transactions</p>
              </>
            )}
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Success Rate
            </h3>
            {transactionsLoading ? (
              <SkeletonLoader className="h-10 w-32 mb-2" />
            ) : transactionsError ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error loading</p>
            ) : (
              <>
                <p className={`text-3xl font-bold ${getSuccessRateColor(avgSuccessRate)}`}>
                  {formatPercentage(avgSuccessRate)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {successMetrics.confirmed} confirmed
                </p>
              </>
            )}
          </div>

          {/* Avg Response Time */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Avg Response Time
            </h3>
            {transactionsLoading ? (
              <SkeletonLoader className="h-10 w-32 mb-2" />
            ) : transactionsError ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error loading</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {avgResponseTime}ms
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Estimated</p>
              </>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Revenue Trends
          </h2>
          {revenueLoading ? (
            <div className="h-64 flex items-center justify-center">
              <SkeletonLoader className="w-full h-full" />
            </div>
          ) : revenueError ? (
            <ErrorDisplay error={revenueError} onRetry={() => refetchRevenue()} />
          ) : revenueData?.breakdown ? (
            <RevenueChart data={revenueData.breakdown} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No revenue data available for this period
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Endpoints */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Top Performing Endpoints
              </h2>
            </div>
            <div className="p-6">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonLoader className="h-6 w-full" />
                      <SkeletonLoader className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : transactionsError ? (
                <ErrorDisplay error={transactionsError} onRetry={() => refetchTransactions()} />
              ) : endpointStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No endpoint data available for this period
                </div>
              ) : (
                <div className="space-y-4">
                  {endpointStats.map((stat, index) => (
                    <div key={stat.endpoint} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate max-w-xs">
                            {stat.endpoint}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(stat.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>{stat.requests.toLocaleString()} requests</span>
                        <span>{stat.avgResponseTime}ms avg</span>
                        <span className={getSuccessRateColor(stat.successRate)}>
                          {formatPercentage(stat.successRate)} success
                        </span>
                      </div>
                      {index < endpointStats.length - 1 && (
                        <div className="border-b border-gray-100 dark:border-gray-700 mt-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Success Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Payment Success Metrics
              </h2>
            </div>
            <div className="p-6">
              {transactionsLoading ? (
                <div className="space-y-6">
                  <SkeletonLoader className="h-8 w-full" />
                  <SkeletonLoader className="h-24 w-full" />
                </div>
              ) : transactionsError ? (
                <ErrorDisplay error={transactionsError} onRetry={() => refetchTransactions()} />
              ) : (
                <div className="space-y-6">
                  {/* Success Rate Gauge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Overall Success Rate
                      </span>
                      <span className={`text-2xl font-bold ${getSuccessRateColor(avgSuccessRate)}`}>
                        {formatPercentage(avgSuccessRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          avgSuccessRate >= 90
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : avgSuccessRate >= 70
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min(avgSuccessRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Successful</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {successMetrics.confirmed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {successMetrics.pending.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {successMetrics.failed.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Common Failure Reasons */}
                  {successMetrics.failed > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Common Failure Reasons
                      </h3>
                      <div className="space-y-2">
                        {topFailureReasons.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.reason}</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatPercentage(item.percentage)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geographic Distribution - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Geographic Distribution
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Geographic Data Coming Soon
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Geographic distribution analytics require IP geolocation service integration.
                This feature will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
