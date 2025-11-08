'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import {
  useSubscriptions,
  useSubscriptionPlans,
  useCreateSubscription,
  useCancelSubscription,
  useAgents,
} from '@/lib/queries';
import type { Subscription, SubscriptionPlan } from '@402pay/shared';

interface CreateSubscriptionForm {
  agentId: string;
  planId: string;
  walletAddress: string;
}

export default function SubscriptionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<CreateSubscriptionForm>({
    agentId: '',
    planId: '',
    walletAddress: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateSubscriptionForm>>({});

  // Fetch data
  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useSubscriptions();

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useSubscriptionPlans();

  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
  } = useAgents();

  // Mutations
  const createMutation = useCreateSubscription({
    onSuccess: () => {
      setShowCreateModal(false);
      setFormData({ agentId: '', planId: '', walletAddress: '' });
      setFormErrors({});
    },
  });

  const cancelMutation = useCancelSubscription({
    onSuccess: () => {
      setShowCancelModal(false);
      setSelectedSubscription(null);
    },
  });

  const subscriptions = subscriptionsData?.subscriptions || [];
  const plans = plansData?.plans || [];
  const agents = agentsData?.agents || [];

  // Calculate stats from real data
  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'active'
    );
    const cancelledSubscriptions = subscriptions.filter(
      (sub) => sub.status === 'cancelled'
    );

    // Calculate MRR from active subscriptions
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const plan = plans.find((p) => p.id === sub.planId);
      return sum + (plan?.pricePerMonth || 0);
    }, 0);

    // Calculate churn rate
    const churnRate =
      subscriptions.length > 0
        ? (cancelledSubscriptions.length / subscriptions.length) * 100
        : 0;

    return {
      mrr,
      activeCount: activeSubscriptions.length,
      totalCount: subscriptions.length,
      churnRate,
    };
  }, [subscriptions, plans]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateSubscriptionForm> = {};

    if (!formData.agentId) {
      errors.agentId = 'Agent is required';
    }
    if (!formData.planId) {
      errors.planId = 'Plan is required';
    }
    if (!formData.walletAddress) {
      errors.walletAddress = 'Wallet address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createMutation.mutate(formData);
  };

  const handleCancelSubscription = () => {
    if (selectedSubscription) {
      cancelMutation.mutate({
        id: selectedSubscription.id,
        cancelAtPeriodEnd: true,
      });
    }
  };

  const getSubscriptionPlan = (planId: string): SubscriptionPlan | undefined => {
    return plans.find((p) => p.id === planId);
  };

  const getAgentName = (agentId: string): string => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || agentId;
  };

  // Loading state
  if (subscriptionsLoading || plansLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              Manage subscription plans and recurring payments
            </p>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>

          {/* Subscription Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (subscriptionsError || plansError) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-semibold mb-2">
              Error loading subscriptions
            </div>
            <p className="text-red-500 mb-4">
              {subscriptionsError?.message || plansError?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => refetchSubscriptions()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              Manage subscription plans and recurring payments
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Create New Subscription
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">
              Monthly Recurring Revenue
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${stats.mrr.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
              From {stats.activeCount} active subscriptions
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">
              Active Subscriptions
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
              {stats.totalCount} total subscriptions
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">Churn Rate</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.churnRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Cancelled subscriptions</p>
          </div>
        </div>

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No subscriptions
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Get started by creating a new subscription.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Subscription
              </button>
            </div>
          </div>
        )}

        {/* Subscriptions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subscriptions.map((subscription) => {
            const plan = getSubscriptionPlan(subscription.planId);
            const agentName = getAgentName(subscription.agentId);

            return (
              <div
                key={subscription.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {plan?.name || 'Unknown Plan'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                        {subscription.id}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        subscription.status
                      )}`}
                    >
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        ${plan?.pricePerMonth?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 ml-2">/month</span>
                    </div>
                    {plan?.currency && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
                        Paid in {plan.currency}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Agent</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{agentName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Wallet Address</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">
                        {subscription.walletAddress.slice(0, 8)}...
                        {subscription.walletAddress.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Current Period</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {format(
                          new Date(subscription.currentPeriodStart),
                          'MMM dd'
                        )}{' '}
                        -{' '}
                        {format(
                          new Date(subscription.currentPeriodEnd),
                          'MMM dd, yyyy'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Created</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {format(new Date(subscription.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 text-yellow-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span className="text-yellow-700 font-medium">
                          Cancels at period end
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {plan?.features && plan.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Features
                      </h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limits */}
                  {plan?.limits && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Usage Limits
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {plan.limits.requestsPerMonth && (
                          <div>
                            Monthly: {plan.limits.requestsPerMonth.toLocaleString()}{' '}
                            requests
                          </div>
                        )}
                        {plan.limits.requestsPerDay && (
                          <div>
                            Daily: {plan.limits.requestsPerDay.toLocaleString()}{' '}
                            requests
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {subscription.status === 'active' &&
                      !subscription.cancelAtPeriodEnd && (
                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowCancelModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    {subscription.status === 'cancelled' && (
                      <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 dark:text-gray-500 rounded-lg text-sm font-medium text-center">
                        Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Subscription
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ agentId: '', planId: '', walletAddress: '' });
                    setFormErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                {/* Agent Selection */}
                <div className="mb-4">
                  <label
                    htmlFor="agentId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Agent <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="agentId"
                    value={formData.agentId}
                    onChange={(e) =>
                      setFormData({ ...formData, agentId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.agentId
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    disabled={agentsLoading}
                    aria-required="true"
                    aria-invalid={!!formErrors.agentId}
                  >
                    <option value="">
                      {agentsLoading ? 'Loading agents...' : 'Select an agent'}
                    </option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.publicKey.slice(0, 8)}...)
                      </option>
                    ))}
                  </select>
                  {formErrors.agentId && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.agentId}
                    </p>
                  )}
                  {agentsError && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      Error loading agents
                    </p>
                  )}
                </div>

                {/* Plan Selection */}
                <div className="mb-4">
                  <label
                    htmlFor="planId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="planId"
                    value={formData.planId}
                    onChange={(e) =>
                      setFormData({ ...formData, planId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.planId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-required="true"
                    aria-invalid={!!formErrors.planId}
                  >
                    <option value="">Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.pricePerMonth}/month
                      </option>
                    ))}
                  </select>
                  {formErrors.planId && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.planId}
                    </p>
                  )}
                  {plans.length === 0 && !plansLoading && (
                    <p className="mt-1 text-sm text-yellow-600" role="alert">
                      No plans available
                    </p>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="mb-6">
                  <label
                    htmlFor="walletAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Wallet Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, walletAddress: e.target.value })
                    }
                    placeholder="Enter Solana wallet address"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm ${
                      formErrors.walletAddress
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    aria-required="true"
                    aria-invalid={!!formErrors.walletAddress}
                  />
                  {formErrors.walletAddress && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.walletAddress}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {createMutation.error && (
                  <div
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    role="alert"
                  >
                    <p className="text-sm text-red-600">
                      {createMutation.error.message}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ agentId: '', planId: '', walletAddress: '' });
                      setFormErrors({});
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Subscription'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Cancel Subscription
                </h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to cancel this subscription? The
                  subscription will remain active until the end of the current
                  billing period.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Current period ends:</strong>{' '}
                    {format(
                      new Date(selectedSubscription.currentPeriodEnd),
                      'MMMM dd, yyyy'
                    )}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {cancelMutation.error && (
                <div
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  role="alert"
                >
                  <p className="text-sm text-red-600">
                    {cancelMutation.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cancelMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Cancelling...
                    </span>
                  ) : (
                    'Cancel Subscription'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
