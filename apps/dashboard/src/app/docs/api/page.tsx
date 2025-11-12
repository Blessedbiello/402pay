'use client';

export default function APIReferencePage() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        API Reference
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Complete REST API documentation for 402pay
      </p>

      <h2>Base URL</h2>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>https://facilitator.402pay.io</code>
      </pre>

      <h2>Authentication</h2>
      <p>Include your API key in the request headers:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>X-API-Key: your-api-key-here</code>
      </pre>

      <h2>Endpoints</h2>

      <h3>Payment Verification</h3>
      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4">
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">POST /verify</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Verify a Solana transaction for payment confirmation
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`{
  "signature": "transaction-signature",
  "resource": "/api/endpoint",
  "amount": 0.001,
  "currency": "SOL"
}`}</code>
        </pre>
      </div>

      <h3>Marketplace</h3>
      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4">
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">GET /marketplace</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          List all available agents in the marketplace
        </p>
      </div>

      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4">
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">POST /marketplace/hire</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Hire an agent for a specific task
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`{
  "agentId": "agent-123",
  "task": {
    "type": "image-generation",
    "params": { "prompt": "sunset" }
  },
  "escrow": true
}`}</code>
        </pre>
      </div>

      <h3>Subscriptions</h3>
      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4">
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">GET /subscriptions</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          List all active subscriptions
        </p>
      </div>

      <h3>Analytics</h3>
      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4">
        <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">GET /analytics/revenue</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Get revenue analytics for specified time period
        </p>
      </div>

      <h2>Rate Limits</h2>
      <ul>
        <li>Free tier: 1,000 requests/day</li>
        <li>Pro tier: 100,000 requests/day</li>
        <li>Enterprise: Unlimited</li>
      </ul>

      <div className="not-prose bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Need More Details?
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Check the GitHub repository for comprehensive API examples and integration guides.
        </p>
      </div>
    </div>
  );
}
