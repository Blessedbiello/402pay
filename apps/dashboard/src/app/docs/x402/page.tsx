'use client';

export default function X402ProtocolPage() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        HTTP 402 Protocol
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Understanding the HTTP 402 Payment Required specification
      </p>

      {/* Overview */}
      <h2>What is HTTP 402?</h2>
      <p>
        HTTP 402 "Payment Required" is a reserved HTTP status code intended for digital payment systems.
        While originally reserved for future use, 402pay provides a complete, production-ready implementation
        of this specification for the Solana blockchain.
      </p>

      {/* How It Works */}
      <h2>How It Works</h2>
      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Request Flow</h3>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">1.</span>
            <span>Client makes a request to a protected endpoint</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">2.</span>
            <span>Server responds with 402 status code and payment instructions</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">3.</span>
            <span>Client creates and signs a Solana transaction</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">4.</span>
            <span>Transaction is submitted to the blockchain</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">5.</span>
            <span>Client retries request with payment proof</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">6.</span>
            <span>Server verifies payment and returns requested content</span>
          </li>
        </ol>
      </div>

      {/* Headers */}
      <h2>HTTP Headers</h2>
      <p>402pay uses custom headers for payment coordination:</p>

      <h3>Request Headers</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`X-Payment-Signature: <base64-encoded-transaction-signature>
X-Payment-Token: <optional-token-mint-address>
X-API-Key: <api-key-for-authenticated-requests>`}</code>
      </pre>

      <h3>Response Headers (402 Status)</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`X-Payment-Required: true
X-Payment-Amount: 0.001
X-Payment-Currency: SOL
X-Payment-Recipient: <recipient-wallet-address>
X-Payment-Network: solana-devnet
X-Payment-Memo: <optional-payment-reference>`}</code>
      </pre>

      {/* Implementation Example */}
      <h2>Implementation Example</h2>
      <h3>Server-Side (Express)</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`import { x402Middleware } from '@402pay/sdk';

app.get('/api/data',
  x402Middleware({
    price: 0.001,
    currency: 'SOL',
    facilitatorUrl: process.env.FACILITATOR_URL,
  }),
  (req, res) => {
    // Payment verified, return protected content
    res.json({ data: 'Protected content' });
  }
);`}</code>
      </pre>

      <h3>Client-Side</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`import { X402Client } from '@402pay/sdk';

const client = new X402Client({
  facilitatorUrl: process.env.FACILITATOR_URL,
});

try {
  const response = await client.get('/api/data', {
    wallet: phantomWallet,
  });
  console.log(response.data);
} catch (error) {
  if (error.status === 402) {
    // Handle payment required
    console.log('Payment instructions:', error.paymentInfo);
  }
}`}</code>
      </pre>

      {/* Security */}
      <h2>Security Features</h2>
      <ul>
        <li><strong>Transaction Verification:</strong> All payments are cryptographically verified on-chain</li>
        <li><strong>Replay Protection:</strong> Transaction signatures are one-time use only</li>
        <li><strong>Memo Validation:</strong> Optional memo fields for additional verification</li>
        <li><strong>Rate Limiting:</strong> Protection against spam and abuse</li>
        <li><strong>API Key Authentication:</strong> Additional layer for authenticated endpoints</li>
      </ul>

      {/* Advanced Features */}
      <h2>Advanced Features</h2>

      <h3>Multi-Token Support</h3>
      <p>Accept payments in SOL, USDC, or any SPL token:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`x402Middleware({
  price: 1.0,
  currency: 'USDC',
  tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
})`}</code>
      </pre>

      <h3>Subscription Payments</h3>
      <p>Set up recurring payments for subscription-based access:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`x402Middleware({
  subscription: {
    interval: 'month',
    price: 10.0,
    currency: 'USDC',
  },
})`}</code>
      </pre>

      {/* Best Practices */}
      <h2>Best Practices</h2>
      <div className="not-prose space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">✓ DO</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Use appropriate pricing for your API endpoints</li>
            <li>• Implement proper error handling for payment failures</li>
            <li>• Cache verification results to reduce blockchain queries</li>
            <li>• Use webhooks for real-time payment notifications</li>
          </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">✗ DON'T</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Store private keys in client-side code</li>
            <li>• Skip transaction verification</li>
            <li>• Use the same payment address for all requests</li>
            <li>• Ignore rate limiting on free tiers</li>
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="not-prose bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Implement?
        </h2>
        <p className="text-blue-100 mb-6">
          Check out the complete API reference for detailed endpoint documentation.
        </p>
        <a
          href="/docs/api"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          API Reference
        </a>
      </div>
    </div>
  );
}
