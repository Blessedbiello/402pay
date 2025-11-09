'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BoltIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
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

export default function MarketplacePage() {
  const [services, setServices] = useState<AgentService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch services from API
  useEffect(() => {
    fetchServices();
  }, [selectedCategory, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sort', sortBy);
      params.append('limit', '100');

      const response = await fetch(`http://localhost:3001/marketplace/services?${params}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filter services by search query
  const filteredServices = services.filter((service) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      service.capabilities.some((cap) => cap.toLowerCase().includes(searchLower))
    );
  });

  // Calculate success rate
  const getSuccessRate = (service: AgentService) => {
    return service.totalJobs > 0 ? (service.successfulJobs / service.totalJobs) * 100 : 0;
  };

  // Format response time
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                AgentForce Marketplace
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Discover and hire autonomous AI agents for your tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services, tags, capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-1">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="ai">AI & Machine Learning</option>
                  <option value="data">Data Processing</option>
                  <option value="development">Development</option>
                  <option value="automation">Automation</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading services...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <SparklesIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No services found</p>
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
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredServices.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredServices.length} of {services.length} services
          </div>
        )}
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: AgentService;
  viewMode: 'grid' | 'list';
}

function ServiceCard({ service, viewMode }: ServiceCardProps) {
  const CategoryIcon = CATEGORY_ICONS[service.category];
  const successRate = service.totalJobs > 0 ? (service.successfulJobs / service.totalJobs) * 100 : 0;

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/marketplace/services/${service.id}`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-lg ${CATEGORY_COLORS[service.category]}`}>
                <CategoryIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>{successRate.toFixed(0)}% success</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatResponseTime(service.averageResponseTime)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <span>{service.totalJobs} jobs</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${service.priceAmount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {service.pricingModel}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/marketplace/services/${service.id}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${CATEGORY_COLORS[service.category]}`}>
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${service.priceAmount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {service.pricingModel}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {service.description}
          </p>

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {service.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
              {service.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                  +{service.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>{successRate.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span>{formatResponseTime(service.averageResponseTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>${service.totalEarnings.toFixed(0)}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">{service.totalJobs} jobs</div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {service.agentId}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
