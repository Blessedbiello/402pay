'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'test' | 'live';
  createdAt: number;
  lastUsedAt?: number;
  permissions: string[];
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    setApiKeys([
      {
        id: 'key_1',
        name: 'Production API',
        key: '402pay_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environment: 'live',
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 2 * 60 * 60 * 1000,
        permissions: ['read', 'write', 'manage'],
      },
      {
        id: 'key_2',
        name: 'Development API',
        key: '402pay_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environment: 'test',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 1 * 60 * 60 * 1000,
        permissions: ['read', 'write'],
      },
      {
        id: 'key_3',
        name: 'Analytics Read-Only',
        key: '402pay_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
        environment: 'live',
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 30 * 60 * 1000,
        permissions: ['read'],
      },
    ]);
  }, []);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•••••••••••••••••••••••••••••';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">API Keys</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your API keys for authentication and integration
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Create API Key
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Keep your API keys secure
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Never share your API keys publicly or commit them to version control.
                Use environment variables to store them securely.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your API Keys</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {key.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          key.environment === 'live'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}
                      >
                        {key.environment.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                        {maskKey(key.key)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        {copiedKey === key.id ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                      {key.lastUsedAt && (
                        <div>
                          <span className="font-medium">Last used:</span>{' '}
                          {new Date(key.lastUsedAt).toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Permissions:</span>{' '}
                        {key.permissions.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Using Your API Keys
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                1. Server-side Integration
              </h3>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
{`import { SolPay402 } from '@402pay/sdk';

const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY,
  network: 'devnet',
});`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                2. Environment Variables
              </h3>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
{`# .env
SOLPAY402_API_KEY=sk_live_your_api_key_here
RECIPIENT_WALLET=YourSolanaWalletAddress`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                3. Test vs Live Mode
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use test keys (sk_test_*) during development and live keys (sk_live_*)
                in production. Test keys won't process real payments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
