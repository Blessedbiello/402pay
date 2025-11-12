'use client';

export default function QuickStartPage() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Quick Start Guide
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Get up and running with 402pay in under 5 minutes
      </p>

      {/* Prerequisites */}
      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+ and npm/yarn</li>
        <li>Solana wallet (Phantom, Solflare, etc.)</li>
        <li>Basic knowledge of Express.js or Next.js</li>
      </ul>

      {/* Installation */}
      <h2>Installation</h2>
      <p>Install the 402pay SDK in your project:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>npm install @402pay/sdk</code>
      </pre>
      <p>Or with yarn:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>yarn add @402pay/sdk</code>
      </pre>

      {/* Basic Setup */}
      <h2>Basic Setup</h2>
      <h3>1. Express Middleware Integration</h3>
      <p>Add payment verification to your Express routes:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`import express from 'express';
import { x402Middleware } from '@402pay/sdk';

const app = express();

// Protect your API endpoint
app.get('/api/premium-content',
  x402Middleware({
    price: 0.001, // Price in SOL
    facilitatorUrl: 'https://facilitator.402pay.io',
  }),
  (req, res) => {
    res.json({ data: 'Premium content here!' });
  }
);

app.listen(3000);`}</code>
      </pre>

      <h3>2. Client-Side Payment</h3>
      <p>Make a payment request from your client:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`import { X402Client } from '@402pay/sdk';

const client = new X402Client({
  facilitatorUrl: 'https://facilitator.402pay.io',
});

// Make a paid request
const response = await client.get('/api/premium-content', {
  wallet: userWallet, // Phantom wallet instance
});

console.log(response.data);`}</code>
      </pre>

      {/* Configuration */}
      <h2>Configuration</h2>
      <p>Set up your environment variables:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`# .env
FACILITATOR_URL=https://facilitator.402pay.io
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=your-private-key
API_KEY=your-api-key`}</code>
      </pre>

      {/* Testing */}
      <h2>Testing</h2>
      <p>Use the demo endpoints to test without real transactions:</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code>{`// Test with demo mode
const client = new X402Client({
  facilitatorUrl: 'https://facilitator.402pay.io',
  demo: true, // Use demo mode for testing
});`}</code>
      </pre>

      {/* Next Steps */}
      <h2>Next Steps</h2>
      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <a
          href="/docs/x402"
          className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            HTTP 402 Protocol
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Learn about the HTTP 402 specification
          </p>
        </a>
        <a
          href="/docs/api"
          className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-500 transition"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            API Reference
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Explore the complete API documentation
          </p>
        </a>
      </div>

      {/* Support */}
      <div className="not-prose bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Need Help?
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Join our community or check out the GitHub repository for more examples and support.
        </p>
      </div>
    </div>
  );
}
