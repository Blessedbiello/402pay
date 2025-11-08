'use client';

import { useMemo } from 'react';

interface RevenueBreakdown {
  date: string; // ISO date string
  amount: number;
  transactionCount: number;
}

interface RevenueChartProps {
  data: RevenueBreakdown[];
}

/**
 * Format date to short day name (Mon, Tue, etc.)
 */
function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Calculate max revenue for scaling
  const maxRevenue = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(...data.map((d) => d.amount));
  }, [data]);

  // Transform data for display
  const chartData = useMemo(() => {
    return data.map((item) => ({
      label: formatDayLabel(item.date),
      revenue: item.amount,
      transactionCount: item.transactionCount,
      fullDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  // Handle empty state
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No revenue data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simple bar chart */}
      <div className="flex items-end justify-between h-64 gap-4">
        {chartData.map((item, index) => {
          // Calculate bar height as percentage of max
          const heightPercentage =
            maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          const barHeight = (heightPercentage / 100) * 240; // 240px max height

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 group relative"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <div className="font-semibold">{item.fullDate}</div>
                <div>${item.revenue.toFixed(2)}</div>
                <div className="text-gray-300 dark:text-gray-400">
                  {item.transactionCount}{' '}
                  {item.transactionCount === 1 ? 'transaction' : 'transactions'}
                </div>
              </div>

              {/* Bar container */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex items-end justify-center h-full">
                <div
                  className="w-full bg-primary-500 dark:bg-primary-600 rounded-t-lg transition-all hover:bg-primary-600 dark:hover:bg-primary-500 relative"
                  style={{
                    height: `${barHeight}px`,
                    minHeight: item.revenue > 0 ? '4px' : '0px',
                  }}
                >
                  {/* Value label above bar */}
                  {item.revenue > 0 && (
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      ${item.revenue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Day label */}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <span className="font-medium">
            Total: ${data.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
          </span>
          <span className="mx-2">•</span>
          <span>
            {data.reduce((sum, d) => sum + d.transactionCount, 0)} transactions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500 dark:bg-primary-600 rounded"></div>
          <span>Revenue (USDC)</span>
        </div>
      </div>
    </div>
  );
}
