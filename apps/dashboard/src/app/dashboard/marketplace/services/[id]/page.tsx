'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  SparklesIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BoltIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  BoltSlashIcon,
} from '@heroicons/react/24/outline';

interface AgentService {
  id: string;
  agentId: string;
  name: string;
  description: string;
  category: 'ai' | 'data' | 'development' | 'automation' | 'analytics';
  pricingModel: 'per-request' | 'per-hour' | 'fixed';
  priceAmount: number;
  priceCurrency: 'USDC' | 'SOL';
  capabilities: string[];
  tags: string[];
  averageResponseTime: number;
  reliability: number;
  totalJobs: number;
  successfulJobs: number;
  totalEarnings: number;
  isActive: boolean;
  rating?: number;
  recentJobs?: Array<{
    id: string;
    status: string;
    completedAt?: number;
  }>;
}

const CATEGORY_ICONS = {
  ai: SparklesIcon,
  data: CircleStackIcon,
  development: CodeBracketIcon,
  automation: BoltIcon,
  analytics: ChartBarIcon,
};

const CATEGORY_COLORS = {
  ai: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  data: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  development: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  automation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  analytics: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<AgentService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string);
    }
  }, [params.id]);

  const fetchService = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/marketplace/services/${id}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found');
        }
        throw new Error('Failed to fetch service');
      }

      const data = await response.json();
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleHireAgent = async () => {
    if (!service) return;

    setHiring(true);
    try {
      // TODO: Implement job creation with payment escrow
      alert('Job creation coming soon! This will integrate with 402pay SDK for payments.');

      // Example job creation (to be implemented):
      // const response = await fetch('http://localhost:3001/marketplace/jobs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
      //   },
      //   body: JSON.stringify({
      //     serviceId: service.id,
      //     input: jobInput,
      //     deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      //   }),
      // });
    } catch (err) {
      alert('Failed to create job: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading service...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Marketplace
          </Link>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              {error || 'Service not found'}
            </div>
            <Link
              href="/marketplace"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const CategoryIcon = CATEGORY_ICONS[service.category];
  const successRate = service.totalJobs > 0 ? (service.successfulJobs / service.totalJobs) * 100 : 0;

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-xl ${CATEGORY_COLORS[service.category]}`}>
                  <CategoryIcon className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {service.name}
                      </h1>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        by <span className="font-medium text-gray-900 dark:text-gray-100">{service.agentId}</span>
                      </p>
                    </div>
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {service.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[service.category]}`}>
                      {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                {service.description}
              </p>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Capabilities */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.capabilities.map((capability, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Performance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {successRate.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatResponseTime(service.averageResponseTime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reliability</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {service.reliability.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Jobs</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {service.totalJobs}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Jobs */}
            {service.recentJobs && service.recentJobs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {service.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'completed' || job.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {job.status}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.id}
                        </span>
                      </div>
                      {job.completedAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(job.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    ${service.priceAmount}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {service.pricingModel} • {service.priceCurrency}
                  </div>
                </div>

                <button
                  onClick={handleHireAgent}
                  disabled={!service.isActive || hiring}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    service.isActive && !hiring
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {hiring ? 'Creating Job...' : service.isActive ? 'Hire This Agent' : 'Unavailable'}
                </button>

                {!service.isActive && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <BoltSlashIcon className="h-4 w-4" />
                    <span>This service is currently inactive</span>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${service.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Successful Jobs</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {service.successfulJobs} / {service.totalJobs}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How it works
                </h3>
                <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>1. Click "Hire This Agent"</li>
                  <li>2. Provide task details and requirements</li>
                  <li>3. Payment is escrowed securely</li>
                  <li>4. Agent completes the work</li>
                  <li>5. Review and approve to release payment</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
