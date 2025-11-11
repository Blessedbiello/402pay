'use client';

import Link from 'next/link';
import { ChevronRight, Home, Package, Zap, Users, CreditCard, Lock, Code, Copy, Check } from 'lucide-react';
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
        className="absolute right-4 top-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors z-10"
        aria-label="Copy code"
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

export default function SDKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/landing" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <span className="text-xl font-bold">402pay</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Documentation
              </Link>
              <Link href="https://github.com/Blessedbiello/402pay" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Docs
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">SDK Documentation</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 font-medium mb-6">
            <Package className="w-5 h-5" />
            <span>TypeScript SDK</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            402pay SDK
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Full-featured TypeScript SDK for integrating x402 payments, subscriptions, agent wallets, and more.
          </p>
        </div>

        {/* Quick Links */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">SDK Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#x402-payments" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Zap className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="font-semibold">x402 Payments</span>
            </a>
            <a href="#subscriptions" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <CreditCard className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-semibold">Subscriptions</span>
            </a>
            <a href="#agent-wallets" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Users className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-semibold">Agent Wallets</span>
            </a>
            <a href="#escrow" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Lock className="w-5 h-5 text-red-600 mr-3" />
              <span className="font-semibold">Escrow</span>
            </a>
            <a href="#middleware" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Code className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-semibold">Middleware</span>
            </a>
          </div>
        </section>

        {/* Installation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Installation</h2>
          <CodeBlock code={`npm install @402pay/sdk @solana/web3.js

# or

yarn add @402pay/sdk @solana/web3.js

# or

pnpm add @402pay/sdk @solana/web3.js`} language="bash" />
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
          <CodeBlock code={`import { X402Client } from '@402pay/sdk';
import { Keypair } from '@solana/web3.js';

// Create client
const wallet = Keypair.generate();
const client = new X402Client({
  payer: wallet,
  rpcUrl: 'https://api.devnet.solana.com',
});

// Make a paid request - automatically handles payment!
const result = await client.paidRequest('http://localhost:3001/api/data');

console.log('Got data:', result.data);
console.log('Payment signature:', result.payment.signature);`} />
        </section>

        {/* x402 Payments */}
        <section id="x402-payments" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Zap className="w-8 h-8 text-yellow-600 mr-3" />
            x402 Payments
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Make micropayments to x402-protected endpoints with automatic payment handling.
          </p>

          <div className="space-y-8">
            {/* X402Client */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">X402Client</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Main client for making paid requests to x402 endpoints.
              </p>

              <CodeBlock code={`import { X402Client } from '@402pay/sdk';
import { Keypair } from '@solana/web3.js';

// Initialize client
const wallet = Keypair.fromSecretKey(yourSecretKey);
const client = new X402Client({
  payer: wallet,
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'solana-devnet',
});

// Make paid request
const result = await client.paidRequest('http://api.example.com/premium');

// Access response data
console.log(result.data);

// Payment info
console.log(result.payment.signature);  // Transaction signature
console.log(result.payment.amount);     // Amount paid
console.log(result.payment.from);       // Your wallet
console.log(result.payment.to);         // Recipient wallet`} />
            </div>

            {/* Check Price First */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Check Price Before Paying</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get payment requirements without making payment to show price to users.
              </p>

              <CodeBlock code={`const { priceInSOL, priceInLamports, requirements } =
  await client.getPaymentRequirements('http://api.example.com/premium');

console.log(\`Price: \${priceInSOL} SOL\`);

// Show confirmation to user
if (confirm(\`Pay \${priceInSOL} SOL for premium data?\`)) {
  const result = await client.paidRequest('http://api.example.com/premium');
  console.log(result.data);
}`} />
            </div>

            {/* Check Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Check Wallet Balance</h3>

              <CodeBlock code={`// Check if you have enough for a payment
const balance = await client.checkBalance('1000000');

if (!balance.hasEnough) {
  console.log(\`Need \${balance.shortfall / 1e9} more SOL\`);
  // Show deposit UI
}

// Get current balance
const balanceSOL = await client.getBalance();
console.log(\`Balance: \${balanceSOL} SOL\`);`} />
            </div>
          </div>
        </section>

        {/* Subscriptions */}
        <section id="subscriptions" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <CreditCard className="w-8 h-8 text-green-600 mr-3" />
            Subscriptions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage recurring subscriptions and metered billing for your APIs.
          </p>

          <div className="space-y-8">
            {/* Setup */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Setup</h3>

              <CodeBlock code={`import { SolPay402 } from '@402pay/sdk';

// Initialize main client
const sdk = new SolPay402({
  apiKey: 'your-api-key',
  network: 'devnet',
  facilitatorUrl: 'http://localhost:3001',
});

// Access subscription manager
const subscriptions = sdk.subscriptions;`} />
            </div>

            {/* Create Subscription */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Create Subscription</h3>

              <CodeBlock code={`// Create a new subscription
const subscription = await subscriptions.create({
  agentId: 'agent-123',
  planId: 'plan-pro-monthly',
  walletAddress: wallet.publicKey.toBase58(),
});

console.log('Subscription ID:', subscription.id);
console.log('Status:', subscription.status);
console.log('Current period ends:', new Date(subscription.currentPeriodEnd));`} />
            </div>

            {/* List Plans */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">List Available Plans</h3>

              <CodeBlock code={`// Get all available plans
const plans = await subscriptions.listPlans();

plans.forEach(plan => {
  console.log(\`\${plan.name}: \${plan.price} \${plan.currency}/\${plan.interval}\`);
  console.log('  Features:', plan.features);
});

// Get specific plan details
const proPlan = await subscriptions.getPlan('plan-pro-monthly');
console.log(proPlan);`} />
            </div>

            {/* Metered Billing */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Metered Billing</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Record usage for pay-as-you-go pricing.
              </p>

              <CodeBlock code={`// Record API usage
const usage = await subscriptions.recordUsage({
  subscriptionId: 'sub-123',
  quantity: 100,  // e.g., 100 API calls
  resource: '/api/premium-data',
  metadata: {
    userId: 'user-456',
    endpoint: '/api/premium-data',
  },
});

console.log('Usage recorded:', usage);`} />
            </div>

            {/* Cancel Subscription */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Cancel Subscription</h3>

              <CodeBlock code={`// Cancel at end of billing period
const canceledSub = await subscriptions.cancel('sub-123', true);

// Cancel immediately
const canceledNow = await subscriptions.cancel('sub-123', false);

console.log('Canceled:', canceledSub.status);
console.log('Ends at:', new Date(canceledSub.currentPeriodEnd));`} />
            </div>
          </div>
        </section>

        {/* Agent Wallets */}
        <section id="agent-wallets" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            Agent Wallets
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create and manage wallets for AI agents with spending limits and permissions.
          </p>

          <div className="space-y-8">
            {/* Create Agent */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Create Agent Wallet</h3>

              <CodeBlock code={`const sdk = new SolPay402({
  apiKey: 'your-api-key',
  facilitatorUrl: 'http://localhost:3001',
});

// Create agent with spending limits
const agent = await sdk.agents.create({
  name: 'My AI Assistant',
  publicKey: agentWallet.publicKey.toBase58(),
  owner: ownerWallet.publicKey.toBase58(),
  spendingLimit: {
    daily: 1000000,        // 0.001 SOL per day
    perTransaction: 100000, // 0.0001 SOL per transaction
  },
  allowedServices: [
    'api.example.com',
    'data-provider.com',
  ],
  metadata: {
    model: 'gpt-4',
    purpose: 'customer-support',
  },
});

console.log('Agent ID:', agent.id);
console.log('Agent pubkey:', agent.publicKey);`} />
            </div>

            {/* List Agents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">List Your Agents</h3>

              <CodeBlock code={`const agents = await sdk.agents.list();

agents.forEach(agent => {
  console.log(\`\${agent.name} (\${agent.id})\`);
  console.log('  Daily limit:', agent.spendingLimit?.daily);
  console.log('  Status:', agent.status);
});`} />
            </div>

            {/* Get Reputation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Check Agent Reputation</h3>

              <CodeBlock code={`const reputation = await sdk.agents.getReputation('agent-123');

console.log('Reputation score:', reputation.score);
console.log('Trust level:', reputation.trustLevel);
console.log('Transactions:', reputation.transactionCount);

// Trust levels: 'new' | 'verified' | 'trusted' | 'premium'`} />
            </div>

            {/* Update Agent */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Update Agent Settings</h3>

              <CodeBlock code={`// Update spending limits
const updated = await sdk.agents.update('agent-123', {
  spendingLimit: {
    daily: 5000000,        // Increase to 0.005 SOL/day
    perTransaction: 500000, // 0.0005 SOL per tx
  },
  allowedServices: [
    'api.example.com',
    'data-provider.com',
    'new-service.com',  // Add new service
  ],
});

console.log('Updated:', updated);`} />
            </div>
          </div>
        </section>

        {/* Escrow */}
        <section id="escrow" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Lock className="w-8 h-8 text-red-600 mr-3" />
            Escrow
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Lock funds in escrow for agent-to-agent transactions and secure payments.
          </p>

          <div className="space-y-8">
            {/* Create Escrow */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Create Escrow</h3>

              <CodeBlock code={`const sdk = new SolPay402({ apiKey: 'your-api-key' });

// Create escrow account
const escrow = await sdk.escrow.create({
  amount: '5000000',  // 0.005 SOL
  sender: senderWallet.publicKey.toBase58(),
  recipient: recipientWallet.publicKey.toBase58(),
  conditions: {
    timeout: Date.now() + 86400000,  // 24 hours
    requireApproval: true,
  },
  metadata: {
    service: 'data-processing',
    taskId: 'task-789',
  },
});

console.log('Escrow ID:', escrow.id);
console.log('Status:', escrow.status);`} />
            </div>

            {/* Release Escrow */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Release Escrow Funds</h3>

              <CodeBlock code={`// Release funds to recipient
const released = await sdk.escrow.release({
  escrowId: 'escrow-123',
  releaser: senderWallet.publicKey.toBase58(),
  signature: await signReleaseMessage(senderWallet),
});

console.log('Released:', released);
console.log('Transaction:', released.transactionId);`} />
            </div>

            {/* Get Escrow Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Check Escrow Status</h3>

              <CodeBlock code={`const escrow = await sdk.escrow.get('escrow-123');

console.log('Status:', escrow.status);  // 'pending' | 'released' | 'refunded'
console.log('Amount:', escrow.amount);
console.log('Created:', new Date(escrow.createdAt));
console.log('Timeout:', new Date(escrow.conditions.timeout));`} />
            </div>
          </div>
        </section>

        {/* Middleware */}
        <section id="middleware" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Code className="w-8 h-8 text-blue-600 mr-3" />
            Middleware (Client-Side)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            React hooks and utilities for frontend integration.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4">React Integration (Coming Soon)</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              React hooks for easy integration with Solana wallet adapters.
            </p>

            <CodeBlock code={`import { useX402Payment } from '@402pay/sdk/react';
import { useWallet } from '@solana/wallet-adapter-react';

function PremiumContent() {
  const wallet = useWallet();
  const { pay, loading, error } = useX402Payment();

  const handleAccess = async () => {
    const result = await pay({
      url: 'http://localhost:3001/api/premium',
      wallet,
    });

    console.log('Access granted:', result.data);
  };

  return (
    <button onClick={handleAccess} disabled={loading}>
      {loading ? 'Processing...' : 'Access Premium Content'}
    </button>
  );
}

// Note: React hooks are coming in a future release`} />
          </div>
        </section>

        {/* TypeScript Support */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">TypeScript Support</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The SDK is written in TypeScript and provides full type definitions.
          </p>

          <CodeBlock code={`import {
  // Clients
  X402Client,
  SolPay402,

  // Managers
  SubscriptionManager,
  AgentManager,
  EscrowManager,

  // Types
  Subscription,
  AgentWallet,
  EscrowAccount,
  PaymentRequirements,

  // Configurations
  X402ClientConfig,
  SolPay402Config,
  CreateSubscriptionParams,
  CreateAgentParams,
} from '@402pay/sdk';

// All types are exported for your convenience
const client: X402Client = new X402Client({ payer: wallet });`} />
        </section>

        {/* Error Handling */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Error Handling</h2>

          <CodeBlock code={`try {
  const result = await client.paidRequest('http://localhost:3001/api/data');
  console.log(result.data);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Show deposit UI
    console.error('Not enough SOL');
  } else if (error.message.includes('Payment rejected')) {
    // Payment failed validation
    console.error('Payment invalid');
  } else if (error.message.includes('Network mismatch')) {
    // Wrong network
    console.error('Check network configuration');
  } else {
    // Other errors
    console.error('Unknown error:', error);
  }
}`} />
        </section>

        {/* What's Next */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/docs/api-reference"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">API Reference</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/quickstart"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Quick Start Guide</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/agentforce"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">AgentForce Marketplace</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/kora-gasless"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Kora Gasless Guide</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
