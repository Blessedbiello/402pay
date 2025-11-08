'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  useAgents,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
} from '@/lib/queries';
import type { AgentWallet } from '@402pay/shared';
import type { CreateAgentData, UpdateAgentData } from '@/lib/api-client';

// Modal Components
function CreateAgentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<CreateAgentData>({
    name: '',
    publicKey: '',
    owner: '',
    spendingLimit: {
      daily: undefined,
      perTransaction: undefined,
    },
    allowedServices: [],
  });
  const [allowedServicesInput, setAllowedServicesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createAgent = useCreateAgent({
    onSuccess: () => {
      // Reset form
      setFormData({
        name: '',
        publicKey: '',
        owner: '',
        spendingLimit: { daily: undefined, perTransaction: undefined },
        allowedServices: [],
      });
      setAllowedServicesInput('');
      setErrors({});
      onClose();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.publicKey.trim()) {
      newErrors.publicKey = 'Public key is required';
    } else if (formData.publicKey.length < 32) {
      newErrors.publicKey = 'Public key must be at least 32 characters';
    }
    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner address is required';
    } else if (formData.owner.length < 32) {
      newErrors.owner = 'Owner address must be at least 32 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData: CreateAgentData = {
      ...formData,
      allowedServices: allowedServicesInput
        ? allowedServicesInput.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    // Remove undefined values from spendingLimit
    if (submitData.spendingLimit) {
      if (!submitData.spendingLimit.daily && !submitData.spendingLimit.perTransaction) {
        submitData.spendingLimit = undefined;
      }
    }

    createAgent.mutate(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Agent Wallet</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Research Agent #42"
              disabled={createAgent.isPending}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Public Key */}
          <div>
            <label htmlFor="publicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Public Key <span className="text-red-500">*</span>
            </label>
            <input
              id="publicKey"
              type="text"
              value={formData.publicKey}
              onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="Solana public key"
              disabled={createAgent.isPending}
            />
            {errors.publicKey && <p className="mt-1 text-sm text-red-600">{errors.publicKey}</p>}
          </div>

          {/* Owner */}
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owner Address <span className="text-red-500">*</span>
            </label>
            <input
              id="owner"
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="Owner's Solana public key"
              disabled={createAgent.isPending}
            />
            {errors.owner && <p className="mt-1 text-sm text-red-600">{errors.owner}</p>}
          </div>

          {/* Daily Spending Limit */}
          <div>
            <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Spending Limit (USDC)
            </label>
            <input
              id="dailyLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.spendingLimit?.daily || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spendingLimit: {
                    ...formData.spendingLimit,
                    daily: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., 100.00"
              disabled={createAgent.isPending}
            />
          </div>

          {/* Per-Transaction Limit */}
          <div>
            <label htmlFor="txLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Per-Transaction Limit (USDC)
            </label>
            <input
              id="txLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.spendingLimit?.perTransaction || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spendingLimit: {
                    ...formData.spendingLimit,
                    perTransaction: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., 10.00"
              disabled={createAgent.isPending}
            />
          </div>

          {/* Allowed Services */}
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allowed Services (comma-separated)
            </label>
            <input
              id="services"
              type="text"
              value={allowedServicesInput}
              onChange={(e) => setAllowedServicesInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., /api/v1/search, /api/v1/analyze"
              disabled={createAgent.isPending}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Optional. Leave empty to allow all services.</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Success Message */}
          {createAgent.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Agent created successfully!</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
              disabled={createAgent.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createAgent.isPending}
            >
              {createAgent.isPending ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateAgentModal({
  agent,
  isOpen,
  onClose,
}: {
  agent: AgentWallet;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<UpdateAgentData>({
    name: agent.name,
    spendingLimit: agent.spendingLimit || { daily: undefined, perTransaction: undefined },
    allowedServices: agent.allowedServices,
  });
  const [allowedServicesInput, setAllowedServicesInput] = useState(
    agent.allowedServices?.join(', ') || ''
  );

  const updateAgent = useUpdateAgent({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: UpdateAgentData = {
      ...formData,
      allowedServices: allowedServicesInput
        ? allowedServicesInput.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    updateAgent.mutate({ id: agent.id, data: submitData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Update Agent: {agent.name}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={updateAgent.isPending}
            />
          </div>

          {/* Daily Spending Limit */}
          <div>
            <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Spending Limit (USDC)
            </label>
            <input
              id="dailyLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.spendingLimit?.daily || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spendingLimit: {
                    ...formData.spendingLimit,
                    daily: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={updateAgent.isPending}
            />
          </div>

          {/* Per-Transaction Limit */}
          <div>
            <label htmlFor="txLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Per-Transaction Limit (USDC)
            </label>
            <input
              id="txLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.spendingLimit?.perTransaction || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spendingLimit: {
                    ...formData.spendingLimit,
                    perTransaction: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={updateAgent.isPending}
            />
          </div>

          {/* Allowed Services */}
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allowed Services (comma-separated)
            </label>
            <input
              id="services"
              type="text"
              value={allowedServicesInput}
              onChange={(e) => setAllowedServicesInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={updateAgent.isPending}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
              disabled={updateAgent.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updateAgent.isPending}
            >
              {updateAgent.isPending ? 'Updating...' : 'Update Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCardSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
    </tr>
  );
}

export default function AgentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentWallet | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<AgentWallet | null>(null);

  const { data, isLoading, error, refetch } = useAgents();
  const deleteAgent = useDeleteAgent({
    onSuccess: () => {
      setDeletingAgent(null);
    },
  });

  const agents = data?.agents || [];

  const getTrustBadgeColor = (level: string) => {
    switch (level) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'trusted':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats
  const totalAgents = agents.length;
  const premiumAgents = agents.filter((a) => a.reputation?.trustLevel === 'premium').length;
  const totalTransactions = agents.reduce((sum, a) => sum + (a.reputation?.transactionCount || 0), 0);
  const avgReputation = totalAgents > 0
    ? Math.round(agents.reduce((sum, a) => sum + (a.reputation?.score || 0), 0) / totalAgents)
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agent Wallets</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              Manage AI agent wallets with spending limits and reputation tracking
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Create Agent
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Total Agents</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? '-' : totalAgents}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Premium Agents</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? '-' : premiumAgents}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? '-' : totalTransactions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Avg Reputation</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? '-' : avgReputation}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Agents</h3>
                <p className="text-red-700 mb-4">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agents List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">All Agents</h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Public Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Spending Limits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AgentCardSkeleton />
                  <AgentCardSkeleton />
                  <AgentCardSkeleton />
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && agents.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No agents yet</h3>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">Get started by creating your first agent wallet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Create Agent
              </button>
            </div>
          )}

          {/* Agents Table */}
          {!isLoading && !error && agents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Public Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Spending Limits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{agent.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {agent.publicKey.substring(0, 8)}...
                          {agent.publicKey.substring(agent.publicKey.length - 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {agent.reputation ? (
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full w-fit ${getTrustBadgeColor(
                                agent.reputation.trustLevel
                              )}`}
                            >
                              {agent.reputation.trustLevel.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                              Score: {agent.reputation.score}/1000
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No reputation</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {agent.spendingLimit ? (
                          <>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              ${agent.spendingLimit.daily || 'Unlimited'}/day
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              ${agent.spendingLimit.perTransaction || 'Unlimited'}/tx
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No limits</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {agent.reputation?.transactionCount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingAgent(agent)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingAgent(agent)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateAgentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      {editingAgent && (
        <UpdateAgentModal
          agent={editingAgent}
          isOpen={true}
          onClose={() => setEditingAgent(null)}
        />
      )}
      <ConfirmDialog
        isOpen={!!deletingAgent}
        onClose={() => setDeletingAgent(null)}
        onConfirm={() => deletingAgent && deleteAgent.mutate(deletingAgent.id)}
        title="Delete Agent"
        message={`Are you sure you want to delete "${deletingAgent?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteAgent.isPending}
      />
    </div>
  );
}
