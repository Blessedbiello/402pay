'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { listApiKeys, createApiKey, revokeApiKey, rotateApiKey, ApiKeyListItem } from '@/lib/api-client';

interface ApiKeyDisplay {
  keyPrefix: string;
  name: string;
  fullKey?: string; // Only populated for newly created keys
  userId: string;
  lastUsed: number;
  isNew?: boolean;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listApiKeys();
      setApiKeys(response.apiKeys.map(key => ({
        keyPrefix: key.keyPrefix,
        name: key.name,
        userId: key.userId,
        lastUsed: key.lastUsed,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    try {
      const response = await createApiKey({ name: newKeyName });
      setNewlyCreatedKey(response.apiKey);
      setNewKeyName('');
      // Reload API keys list
      await loadApiKeys();
    } catch (err) {
      alert(`Failed to create API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRevokeApiKey = async (keyPrefix: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await revokeApiKey(keyPrefix);
      await loadApiKeys();
    } catch (err) {
      alert(`Failed to revoke API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRotateApiKey = async (keyPrefix: string, name: string) => {
    if (!confirm(`Rotate API key "${name}"? A new key will be created and the old one will remain active until you revoke it.`)) {
      return;
    }

    try {
      const response = await rotateApiKey(keyPrefix);
      setNewlyCreatedKey(response.apiKey);
      alert(response.message + '\n\n' + response.warning);
      await loadApiKeys();
    } catch (err) {
      alert(`Failed to rotate API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length < 15) return key;
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

        {/* Newly Created Key Banner */}
        {newlyCreatedKey && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                  API Key Created Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1 mb-3">
                  Save this key now - it won't be shown again for security reasons.
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded border border-green-300 dark:border-green-700">
                    {newlyCreatedKey}
                  </code>
                  <button
                    onClick={() => {
                      copyToClipboard(newlyCreatedKey, 'new-key');
                      alert('API key copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Copy Key
                  </button>
                </div>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your API Keys</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No API keys yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys.map((key) => (
                <div key={key.keyPrefix} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {key.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <code className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          {key.fullKey ? maskKey(key.fullKey) : key.keyPrefix}
                        </code>
                        {key.fullKey && (
                          <button
                            onClick={() => copyToClipboard(key.fullKey!, key.keyPrefix)}
                            className="px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          >
                            {copiedKey === key.keyPrefix ? '✓ Copied' : 'Copy'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="font-medium">User ID:</span> {key.userId}
                        </div>
                        <div>
                          <span className="font-medium">Last used:</span>{' '}
                          {new Date(key.lastUsed).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRotateApiKey(key.keyPrefix, key.name)}
                        className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        Rotate
                      </button>
                      <button
                        onClick={() => handleRevokeApiKey(key.keyPrefix, key.name)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Create API Key
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreateApiKey();
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        )}

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
