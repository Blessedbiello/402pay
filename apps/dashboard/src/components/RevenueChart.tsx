'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueBreakdown {
  date: string; // ISO date string
  amount: number;
  transactionCount: number;
}

interface RevenueChartProps {
  data: RevenueBreakdown[];
}

type ChartType = 'bar' | 'area';

/**
 * Format date to short day name (Mon, Tue, etc.)
 */
function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {data.fullDate}
      </p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            ${data.revenue.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {data.transactionCount}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Avg per TX:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${data.transactionCount > 0 ? (data.revenue / data.transactionCount).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map((item) => ({
      label: formatDayLabel(item.date),
      revenue: item.amount,
      transactionCount: item.transactionCount,
      fullDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));
  }, [data]);

  // Calculate totals
  const totals = useMemo(() => ({
    revenue: data.reduce((sum, d) => sum + d.amount, 0),
    transactions: data.reduce((sum, d) => sum + d.transactionCount, 0),
  }), [data]);

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
      {/* Chart type selector */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            chartType === 'bar'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType('area')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            chartType === 'area'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Area Chart
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="label"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
            <Bar
              dataKey="revenue"
              fill="rgb(59, 130, 246)"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            />
          </BarChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="label"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              animationDuration={800}
              animationBegin={0}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Revenue:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
              ${totals.revenue.toFixed(2)}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Transactions:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
              {totals.transactions.toLocaleString()}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Avg per TX:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
              ${totals.transactions > 0 ? (totals.revenue / totals.transactions).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500 rounded"></div>
          <span>Revenue (USDC)</span>
        </div>
      </div>
    </div>
  );
}
