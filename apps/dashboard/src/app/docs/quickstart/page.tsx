'use client';

import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={copyCode}
        className="absolute right-4 top-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>
      <pre className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <span className="text-xl font-bold">402pay</span>
            </Link>
            <Link href="/docs" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Docs</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/docs" className="hover:text-blue-600">Docs</Link>
          <span>/</span>
          <span>Quick Start</span>
        </div>

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1>Quick Start Guide</h1>
          <p className="lead">
            Get started with 402pay in less than 5 minutes. This guide will walk you through
            installing the SDK, configuring your first payment endpoint, and testing it.
          </p>

          <h2>1. Install the SDK</h2>
          <p>First, install the 402pay SDK using npm or yarn:</p>

          <CodeBlock code={`npm install @402pay/sdk @solana/web3.js

# or with yarn
yarn add @402pay/sdk @solana/web3.js`} language="bash" />

          <h2>2. Set Up Environment Variables</h2>
          <p>Create a <code>.env</code> file in your project root:</p>

          <CodeBlock code={`# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PAYMENT_RECIPIENT_ADDRESS=your-solana-wallet-address-here

# Optional: Kora RPC for gasless transactions
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your-kora-api-key`} language="bash" />

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Getting a Solana Wallet
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 m-0">
              If you don't have a Solana wallet yet, you can create one using Phantom, Solflare,
              or generate a keypair using <code>solana-keygen</code>.
            </p>
          </div>

          <h2>3. Create Your First Paid Endpoint</h2>
          <p>Here's a complete example using Express.js:</p>

          <CodeBlock code={`import express from 'express';
import { x402Middleware } from '@402pay/facilitator';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Protected endpoint requiring payment
app.get('/api/premium-data',
  x402Middleware({
    amount: '1000000', // 0.001 SOL in lamports
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'Access to premium data API',
    network: 'solana-devnet',
    maxTimeoutSeconds: 60,
  }),
  (req, res) => {
    // Payment verified! Serve protected content
    res.json({
      data: 'This is your premium content!',
      timestamp: Date.now(),
    });
  }
);

// Start server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
  console.log('Try: curl http://localhost:3001/api/premium-data');
});`} />

          <h2>4. Test Your Endpoint</h2>
          <p>When you call your protected endpoint without payment, you'll get a 402 response:</p>

          <CodeBlock code={`curl http://localhost:3001/api/premium-data`} language="bash" />

          <p>Response:</p>

          <CodeBlock code={`{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "solana-devnet",
    "maxAmountRequired": "1000000",
    "payTo": "YOUR_WALLET_ADDRESS",
    "resource": "/api/premium-data",
    "description": "Access to premium data API",
    "maxTimeoutSeconds": 60
  }]
}`} language="json" />

          <h2>5. Make a Payment (Client Side)</h2>
          <p>Here's how to make a payment from your client application:</p>

          <CodeBlock code={`import { Connection, Keypair, SystemProgram, Transaction } from '@solana/web3.js';

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const userWallet = Keypair.fromSecretKey(/* your secret key */);

// 1. Get payment requirements
const requirementsResponse = await fetch('http://localhost:3001/api/premium-data');
const requirements = await requirementsResponse.json();

// 2. Create and sign transaction
const recipientPubkey = new PublicKey(requirements.accepts[0].payTo);
const amount = parseInt(requirements.accepts[0].maxAmountRequired);

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: userWallet.publicKey,
    toPubkey: recipientPubkey,
    lamports: amount,
  })
);

// Get recent blockhash
const { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = userWallet.publicKey;

// Sign transaction
transaction.sign(userWallet);

// 3. Submit to Solana
const signature = await connection.sendRawTransaction(
  transaction.serialize()
);
await connection.confirmTransaction(signature);

// 4. Create payment payload
const paymentPayload = {
  x402Version: 1,
  scheme: 'exact',
  network: 'solana-devnet',
  payload: {
    signature,
    from: userWallet.publicKey.toString(),
    to: recipientPubkey.toString(),
    amount: amount.toString(),
    timestamp: Date.now(),
  },
};

// 5. Call API with payment proof
const dataResponse = await fetch('http://localhost:3001/api/premium-data', {
  headers: {
    'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
  },
});

const data = await dataResponse.json();
console.log('Success!', data);`} />

          <h2>6. Optional: Enable Gasless Transactions</h2>
          <p>
            With Kora RPC, users don't need SOL for gas fees. Just set <code>useGasless: true</code>:
          </p>

          <CodeBlock code={`app.get('/api/gasless-endpoint',
  x402Middleware({
    amount: '1000000',
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'Gasless payment endpoint',
    useGasless: true, // ← Enable gasless mode
    facilitatorUrl: process.env.KORA_FACILITATOR_URL,
  }),
  (req, res) => {
    res.json({ data: 'Paid with zero gas fees!' });
  }
);`} />

          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-6">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
              ✅ You're All Set!
            </p>
            <p className="text-sm text-green-800 dark:text-green-300 m-0">
              You now have a working paid API endpoint! Users pay in SOL/USDC, and you automatically
              verify payments on-chain.
            </p>
          </div>

          <h2>What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <Link href="/docs/kora-gasless" className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
              <h3 className="font-bold mb-2">Kora Gasless Setup</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable zero gas fees for your users</p>
            </Link>

            <Link href="/docs/subscriptions" className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
              <h3 className="font-bold mb-2">Subscriptions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set up recurring payments</p>
            </Link>

            <Link href="/docs/api-reference" className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
              <h3 className="font-bold mb-2">API Reference</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete API documentation</p>
            </Link>

            <Link href="/docs/examples" className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
              <h3 className="font-bold mb-2">More Examples</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">See 402pay in action</p>
            </Link>
          </div>

          <h2>Need Help?</h2>
          <ul>
            <li>
              <a href="https://github.com/Blessedbiello/402pay" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </li>
            <li>
              <Link href="/docs">Browse Documentation</Link>
            </li>
            <li>
              <Link href="/marketplace">Explore AgentForce</Link>
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
