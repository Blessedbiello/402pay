'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import { useTransactions } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';
import type { Transaction } from '@402pay/shared';

type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const limit = 20;

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch transactions from backend
  const { data, isLoading, error, refetch } = useTransactions({
    limit,
    offset: (page - 1) * limit,
  });

  // Filter transactions client-side based on search and status
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];

    let filtered = data.transactions;

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((tx) => {
        return (
          tx.id.toLowerCase().includes(searchLower) ||
          tx.signature.toLowerCase().includes(searchLower) ||
          tx.payer.toLowerCase().includes(searchLower) ||
          (tx.resource && tx.resource.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((tx) => tx.status === filterStatus);
    }

    return filtered;
  }, [data?.transactions, debouncedSearch, filterStatus]);

  // Calculate stats from confirmed transactions
  const stats = useMemo(() => {
    if (!data?.transactions) {
      return {
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0,
        avgTransaction: 0,
      };
    }

    const allTransactions = data.transactions;
    const confirmedTransactions = allTransactions.filter(
      (tx) => tx.status === 'confirmed'
    );

    const totalVolume = confirmedTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const totalTransactions = allTransactions.length;
    const successRate =
      totalTransactions > 0
        ? (confirmedTransactions.length / totalTransactions) * 100
        : 0;
    const avgTransaction =
      confirmedTransactions.length > 0
        ? totalVolume / confirmedTransactions.length
        : 0;

    return {
      totalVolume,
      totalTransactions,
      successRate,
      avgTransaction,
    };
  }, [data?.transactions]);

  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    if (!data?.transactions) {
      return { all: 0, confirmed: 0, pending: 0, failed: 0 };
    }

    const counts = {
      all: data.transactions.length,
      confirmed: 0,
      pending: 0,
      failed: 0,
    };

    data.transactions.forEach((tx) => {
      if (tx.status === 'confirmed') counts.confirmed++;
      else if (tx.status === 'pending') counts.pending++;
      else if (tx.status === 'failed') counts.failed++;
    });

    return counts;
  }, [data?.transactions]);

  // Pagination calculations
  const totalPages = Math.ceil((data?.total || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleExport = async () => {
    if (!data?.transactions || data.transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    setIsExporting(true);
    try {
      // Prepare CSV content
      const headers = [
        'Timestamp',
        'Transaction ID',
        'Signature',
        'Amount',
        'Currency',
        'Payer',
        'Recipient',
        'Status',
        'Resource',
        'Agent ID',
      ];

      const rows = data.transactions.map((tx) => [
        format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        tx.id,
        tx.signature,
        tx.amount.toString(),
        tx.currency,
        tx.payer,
        tx.recipient,
        tx.status,
        tx.resource || '',
        tx.agentId || '',
      ]);

      // Create CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all payment transactions across your x402 network
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Volume
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${stats.totalVolume.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">USDC (Confirmed)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Transactions
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalTransactions}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Success Rate
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confirmed / Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Avg Transaction
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${stats.avgTransaction.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">USDC (Confirmed)</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by transaction ID, payer, or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">
                    All Status ({statusCounts.all})
                  </option>
                  <option value="confirmed">
                    Confirmed ({statusCounts.confirmed})
                  </option>
                  <option value="pending">
                    Pending ({statusCounts.pending})
                  </option>
                  <option value="failed">
                    Failed ({statusCounts.failed})
                  </option>
                </select>
                <button
                  onClick={handleExport}
                  disabled={isExporting || !data?.transactions || data.transactions.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              All Transactions
            </h2>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Error Loading Transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Resource
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {debouncedSearch || filterStatus !== 'all'
                  ? 'No results found'
                  : 'No transactions yet'}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {debouncedSearch || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Transactions will appear here once payments are processed'}
              </p>
            </div>
          )}

          {/* Table Content */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Resource
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {format(new Date(tx.timestamp), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(tx.timestamp), 'HH:mm:ss')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="text-sm font-mono text-gray-900 dark:text-gray-100 max-w-[200px] truncate"
                            title={tx.signature}
                          >
                            {tx.signature}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${tx.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {tx.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="text-sm text-gray-900 dark:text-gray-100 max-w-[150px] truncate"
                            title={tx.payer}
                          >
                            {tx.payer}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {tx.status.charAt(0).toUpperCase() +
                              tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {tx.resource || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {page} of {totalPages} ({data?.total} total
                    transactions)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={!hasPrevPage}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {pageNumbers.map((pageNum, idx) => {
                        if (pageNum === -1) {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500 dark:text-gray-400">
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageClick(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              page === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
