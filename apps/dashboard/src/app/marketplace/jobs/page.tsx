'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Job {
  id: string;
  clientAgentId: string;
  serviceId: string;
  providerAgentId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'approved' | 'disputed' | 'cancelled';
  input: Record<string, any>;
  output?: Record<string, any>;
  paymentAmount: number;
  paymentCurrency: string;
  escrowAddress?: string;
  escrowStatus: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed';
  escrowTransactionId?: string;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
  approvedAt?: number;
  deadline: number;
  serviceName?: string;
}

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const ESCROW_STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  escrowed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  released: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  refunded: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '100');

      const response = await fetch(`http://localhost:3001/marketplace/jobs?${params}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, action: 'accept' | 'submit' | 'approve' | 'dispute', payload?: any) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/marketplace/jobs/${jobId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        },
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} job`);
      }

      // Refresh jobs list
      await fetchJobs();

      // Update selected job if it's the one we just acted on
      if (selectedJob?.id === jobId) {
        const response = await fetch(`http://localhost:3001/marketplace/jobs/${jobId}`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key' },
        });
        if (response.ok) {
          const updatedJob = await response.json();
          setSelectedJob(updatedJob);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.id.toLowerCase().includes(searchLower) ||
      job.clientAgentId.toLowerCase().includes(searchLower) ||
      job.providerAgentId.toLowerCase().includes(searchLower) ||
      (job.serviceName && job.serviceName.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const remaining = deadline - now;
    if (remaining < 0) return 'Overdue';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Due soon';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Marketplace Jobs
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage your agent jobs
              </p>
            </div>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Services
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading jobs...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ClockIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No jobs found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => setSelectedJob(job)}
                onAction={handleJobAction}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onAction={handleJobAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onClick: () => void;
  onAction: (jobId: string, action: 'accept' | 'submit' | 'approve' | 'dispute', payload?: any) => Promise<void>;
  actionLoading: boolean;
}

function JobCard({ job, onClick, onAction, actionLoading }: JobCardProps) {
  const isOverdue = job.deadline < Date.now() && job.status !== 'approved' && job.status !== 'cancelled';

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESCROW_STATUS_STYLES[job.escrowStatus]}`}>
              {job.escrowStatus}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {job.serviceName || job.serviceId}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Job ID: {job.id.slice(0, 16)}...
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${job.paymentAmount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{job.paymentCurrency}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Client:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{job.clientAgentId}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Provider:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{job.providerAgentId}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <ClockIcon className="h-4 w-4" />
          <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
            {new Date(job.deadline).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction(job.id, 'accept');
              }}
              disabled={actionLoading}
              className="text-sm px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              Accept
            </button>
          )}
          {job.status === 'accepted' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction(job.id, 'submit', {
                  output: { result: 'Completed', status: 'success' },
                });
              }}
              disabled={actionLoading}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Submit
            </button>
          )}
          {job.status === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction(job.id, 'approve');
              }}
              disabled={actionLoading}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onAction: (jobId: string, action: 'accept' | 'submit' | 'approve' | 'dispute', payload?: any) => Promise<void>;
  actionLoading: boolean;
}

function JobDetailModal({ job, onClose, onAction, actionLoading }: JobDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Details</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Job Status</label>
              <div className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${STATUS_STYLES[job.status]}`}>
                {job.status.replace('_', ' ')}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Escrow Status</label>
              <div className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${ESCROW_STATUS_STYLES[job.escrowStatus]}`}>
                {job.escrowStatus}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Amount</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${job.paymentAmount} {job.paymentCurrency}
                </div>
              </div>
              {job.escrowAddress && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Escrow Address</div>
                  <div className="text-xs font-mono text-gray-900 dark:text-gray-100">
                    {job.escrowAddress.slice(0, 8)}...{job.escrowAddress.slice(-8)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Client Agent</label>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {job.clientAgentId}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Provider Agent</label>
              <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {job.providerAgentId}
              </div>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Job Input</label>
            <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(job.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          {job.output && (
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Job Output</label>
              <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(job.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Timeline */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Timeline</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-gray-900 dark:text-gray-100">Created:</span>
                <span className="text-gray-600 dark:text-gray-400">{new Date(job.createdAt).toLocaleString()}</span>
              </div>
              {job.acceptedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">Accepted:</span>
                  <span className="text-gray-600 dark:text-gray-400">{new Date(job.acceptedAt).toLocaleString()}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">Completed:</span>
                  <span className="text-gray-600 dark:text-gray-400">{new Date(job.completedAt).toLocaleString()}</span>
                </div>
              )}
              {job.approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">Approved:</span>
                  <span className="text-gray-600 dark:text-gray-400">{new Date(job.approvedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="h-4 w-4 text-orange-500" />
                <span className="text-gray-900 dark:text-gray-100">Deadline:</span>
                <span className="text-gray-600 dark:text-gray-400">{new Date(job.deadline).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {job.status === 'pending' && (
              <button
                onClick={() => onAction(job.id, 'accept')}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Accept Job
              </button>
            )}
            {job.status === 'accepted' && (
              <button
                onClick={() => onAction(job.id, 'submit', {
                  output: { result: 'Work completed successfully', status: 'success' },
                })}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Submit Work
              </button>
            )}
            {job.status === 'completed' && (
              <>
                <button
                  onClick={() => onAction(job.id, 'approve')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve & Release Payment
                </button>
                <button
                  onClick={() => onAction(job.id, 'dispute', {
                    reason: 'Work does not meet requirements',
                  })}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Dispute
                </button>
              </>
            )}
            {(job.status === 'approved' || job.status === 'disputed') && (
              <div className="flex-1 text-center py-2 text-gray-600 dark:text-gray-400">
                This job is {job.status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
