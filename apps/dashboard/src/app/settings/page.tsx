'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface SettingsState {
  apiConfig: {
    rpcEndpoint: string;
    network: 'mainnet-beta' | 'testnet' | 'devnet';
    timeout: number;
  };
  notifications: {
    emailTransactions: boolean;
    emailWeeklyReport: boolean;
    emailSecurityAlerts: boolean;
    slackIntegration: boolean;
  };
  webhooks: {
    transactionUrl: string;
    subscriptionUrl: string;
    failureUrl: string;
  };
  security: {
    twoFactorEnabled: boolean;
    apiKeyRotationDays: number;
    ipWhitelist: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    apiConfig: {
      rpcEndpoint: 'https://api.mainnet-beta.solana.com',
      network: 'mainnet-beta',
      timeout: 30000,
    },
    notifications: {
      emailTransactions: true,
      emailWeeklyReport: true,
      emailSecurityAlerts: true,
      slackIntegration: false,
    },
    webhooks: {
      transactionUrl: 'https://api.example.com/webhooks/transaction',
      subscriptionUrl: 'https://api.example.com/webhooks/subscription',
      failureUrl: 'https://api.example.com/webhooks/failure',
    },
    security: {
      twoFactorEnabled: false,
      apiKeyRotationDays: 90,
      ipWhitelist: '',
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveChanges = () => {
    setSaveStatus('saving');
    // Placeholder for save functionality
    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
      console.log('Settings saved:', settings);
    }, 1000);
  };

  const handleRotateApiKey = () => {
    console.log('Rotate API key');
    // Placeholder for API key rotation
  };

  const updateSettings = (section: keyof SettingsState, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your x402 payment infrastructure
          </p>
        </div>

        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              API Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your Solana RPC endpoint and network settings
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                RPC Endpoint
              </label>
              <input
                type="text"
                value={settings.apiConfig.rpcEndpoint}
                onChange={(e) =>
                  updateSettings('apiConfig', 'rpcEndpoint', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="https://api.mainnet-beta.solana.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your Solana RPC endpoint URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Network
              </label>
              <select
                value={settings.apiConfig.network}
                onChange={(e) =>
                  updateSettings(
                    'apiConfig',
                    'network',
                    e.target.value as 'mainnet-beta' | 'testnet' | 'devnet'
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="mainnet-beta">Mainnet Beta</option>
                <option value="testnet">Testnet</option>
                <option value="devnet">Devnet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.apiConfig.timeout}
                onChange={(e) =>
                  updateSettings('apiConfig', 'timeout', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="1000"
                max="60000"
                step="1000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum time to wait for RPC responses
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose how you want to receive updates
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Transaction Notifications
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified for every transaction
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailTransactions}
                  onChange={(e) =>
                    updateSettings(
                      'notifications',
                      'emailTransactions',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Weekly Reports
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive weekly performance summaries
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailWeeklyReport}
                  onChange={(e) =>
                    updateSettings(
                      'notifications',
                      'emailWeeklyReport',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Security Alerts
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Critical security notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailSecurityAlerts}
                  onChange={(e) =>
                    updateSettings(
                      'notifications',
                      'emailSecurityAlerts',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Slack Integration
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send notifications to Slack
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.slackIntegration}
                  onChange={(e) =>
                    updateSettings(
                      'notifications',
                      'slackIntegration',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Webhook Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure webhook endpoints for real-time event notifications
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhooks.transactionUrl}
                onChange={(e) =>
                  updateSettings('webhooks', 'transactionUrl', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="https://api.example.com/webhooks/transaction"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Receive notifications for completed transactions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subscription Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhooks.subscriptionUrl}
                onChange={(e) =>
                  updateSettings('webhooks', 'subscriptionUrl', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="https://api.example.com/webhooks/subscription"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Receive notifications for subscription events
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Failure Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhooks.failureUrl}
                onChange={(e) =>
                  updateSettings('webhooks', 'failureUrl', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="https://api.example.com/webhooks/failure"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Receive notifications for failed transactions
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Security Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage security and authentication settings
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) =>
                    updateSettings('security', 'twoFactorEnabled', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key Rotation (days)
              </label>
              <input
                type="number"
                value={settings.security.apiKeyRotationDays}
                onChange={(e) =>
                  updateSettings(
                    'security',
                    'apiKeyRotationDays',
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="30"
                max="365"
                step="30"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically rotate API keys every specified number of days
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IP Whitelist
              </label>
              <textarea
                value={settings.security.ipWhitelist}
                onChange={(e) =>
                  updateSettings('security', 'ipWhitelist', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                rows={3}
                placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter IP addresses (one per line) that are allowed to access your
                API
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleRotateApiKey}
                className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Rotate API Key Now
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Manually rotate your API key. This will invalidate your current key.
              </p>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-4">
          {hasChanges && (
            <span className="text-sm text-gray-600 dark:text-gray-400">You have unsaved changes</span>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || saveStatus === 'saving'}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              hasChanges && saveStatus !== 'saving'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? 'Saved!'
                : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
