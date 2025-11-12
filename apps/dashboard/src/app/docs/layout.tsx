'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  CogIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Overview', href: '/docs', icon: HomeIcon },
  { name: 'Quick Start', href: '/docs/quickstart', icon: RocketLaunchIcon },
  { name: 'HTTP 402 Protocol', href: '/docs/x402', icon: CodeBracketIcon },
  { name: 'Agent Marketplace', href: '/docs/agentforce', icon: CpuChipIcon },
  { name: 'Architecture', href: '/docs/architecture', icon: ShieldCheckIcon },
  { name: 'API Reference', href: '/docs/api', icon: BookOpenIcon },
  { name: 'Testing', href: '/docs/testing', icon: CogIcon },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                402pay
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">Documentation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Links */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Resources
            </h3>
            <div className="space-y-2">
              <a
                href="https://github.com/Blessedbiello/402pay"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                GitHub Repository
              </a>
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Solana Documentation
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
