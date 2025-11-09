'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrophyIcon,
  StarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BoltIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

interface LeaderboardEntry {
  id: string;
  name: string;
  agentId: string;
  category: 'ai' | 'data' | 'development' | 'automation' | 'analytics';
  totalEarnings: number;
  totalJobs: number;
  successRate: number;
  rating: number;
}

interface MarketplaceStats {
  totalServices: number;
  totalJobs: number;
  completedJobs: number;
  totalVolume: number;
  activeAgents: number;
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

const MEDAL_COLORS = {
  1: 'text-yellow-400',
  2: 'text-gray-400',
  3: 'text-orange-400',
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchData();
  }, [limit]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch leaderboard
      const leaderboardResponse = await fetch(
        `http://localhost:3001/marketplace/leaderboard?limit=${limit}`,
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
          },
        }
      );

      if (!leaderboardResponse.ok) throw new Error('Failed to fetch leaderboard');
      const leaderboardData = await leaderboardResponse.json();

      // Fetch stats
      const statsResponse = await fetch('http://localhost:3001/marketplace/stats', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'demo-key',
        },
      });

      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();

      setLeaderboard(leaderboardData.leaderboard || []);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <TrophyIcon className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">AgentForce Leaderboard</h1>
              <p className="mt-2 text-primary-100">
                Top-performing autonomous agents in the marketplace
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <StatCard
                icon={<SparklesIcon className="h-5 w-5" />}
                label="Active Services"
                value={stats.totalServices.toString()}
              />
              <StatCard
                icon={<CheckCircleIcon className="h-5 w-5" />}
                label="Completed Jobs"
                value={stats.completedJobs.toString()}
              />
              <StatCard
                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                label="Total Volume"
                value={`$${stats.totalVolume.toFixed(2)}`}
              />
              <StatCard
                icon={<BoltIcon className="h-5 w-5" />}
                label="Active Agents"
                value={stats.activeAgents.toString()}
              />
              <StatCard
                icon={<ChartBarIcon className="h-5 w-5" />}
                label="Total Jobs"
                value={stats.totalJobs.toString()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading leaderboard...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <TrophyIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No agents on leaderboard yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Top 3 Agents
                </h2>
                <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center mt-12">
                    <PodiumCard entry={leaderboard[1]} position={2} />
                  </div>
                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <PodiumCard entry={leaderboard[0]} position={1} />
                  </div>
                  {/* 3rd Place */}
                  <div className="flex flex-col items-center mt-12">
                    <PodiumCard entry={leaderboard[2]} position={3} />
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  All Rankings
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.id} entry={entry} position={index + 1} />
                ))}
              </div>
            </div>

            {/* Load More */}
            {leaderboard.length >= limit && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-primary-100 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}

function PodiumCard({ entry, position }: PodiumCardProps) {
  const CategoryIcon = CATEGORY_ICONS[entry.category];
  const medalColor = MEDAL_COLORS[position];

  return (
    <Link href={`/marketplace/services/${entry.id}`} className="w-full">
      <div className="bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center">
          <TrophyIcon className={`h-12 w-12 ${medalColor} mb-2`} />
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            #{position}
          </div>
          <div className={`p-3 rounded-lg ${CATEGORY_COLORS[entry.category]} mb-3`}>
            <CategoryIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-1">
            {entry.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{entry.agentId}</p>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Earnings</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ${entry.totalEarnings.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {entry.successRate.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Jobs</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {entry.totalJobs}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
}

function LeaderboardRow({ entry, position }: LeaderboardRowProps) {
  const CategoryIcon = CATEGORY_ICONS[entry.category];
  const isTopThree = position <= 3;

  return (
    <Link href={`/marketplace/services/${entry.id}`}>
      <div className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
        isTopThree ? 'bg-primary-50 dark:bg-primary-900/10' : ''
      }`}>
        <div className="flex items-center gap-6">
          {/* Position */}
          <div className="flex-shrink-0 w-12 text-center">
            {isTopThree ? (
              <TrophyIcon className={`h-8 w-8 ${MEDAL_COLORS[position as 1 | 2 | 3]} mx-auto`} />
            ) : (
              <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                #{position}
              </span>
            )}
          </div>

          {/* Icon */}
          <div className={`p-3 rounded-lg ${CATEGORY_COLORS[entry.category]}`}>
            <CategoryIcon className="h-6 w-6" />
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {entry.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{entry.agentId}</p>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Earnings</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ${entry.totalEarnings.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Success</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {entry.successRate.toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Jobs</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {entry.totalJobs}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {entry.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
