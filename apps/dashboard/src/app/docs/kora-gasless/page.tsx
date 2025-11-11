'use client';

import Link from 'next/link';
import { ChevronRight, Home, Zap, Shield, Clock, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
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

export default function KoraGaslessPage() {
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
          <span className="text-gray-900 dark:text-white font-medium">Kora Gasless Transactions</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 font-medium mb-6">
            <Zap className="w-5 h-5" />
            <span>Zero Gas Fees</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Kora Gasless Transactions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Enable zero-fee transactions for your users with Kora RPC integration.
            Your server pays the gas fees, users pay nothing.
          </p>
        </div>

        {/* Why Gasless Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Gasless Transactions?</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Better UX</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Users don't need SOL or any native tokens to make payments. Just the payment token.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Onboarding</h3>
              <p className="text-gray-600 dark:text-gray-400">
                New users can start transacting immediately without acquiring native tokens first.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Predictable Costs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You control gas fees and can bundle them into your pricing or absorb them.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-8">
            <ol className="space-y-6">
              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">User initiates payment</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    User creates a transaction with their payment token (e.g., USDC) but no SOL for gas.
                  </p>
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Kora RPC receives transaction</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your Kora RPC server validates the transaction and checks if the token is in the allowlist.
                  </p>
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Fee payer adds gas</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Kora's fee payer keypair signs the transaction and adds SOL for gas fees.
                  </p>
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Transaction submitted</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Kora submits the fully-signed transaction to Solana. User pays zero gas!
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Setup Guide */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Setup Guide</h2>

          <div className="space-y-8">
            {/* Step 1: Install Kora */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Install Kora RPC
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Install the Kora RPC server using Cargo:
              </p>
              <CodeBlock code={`# Install Kora RPC
cargo install kora-rpc

# Or build from source
git clone https://github.com/solana-foundation/kora
cd kora
cargo build --release`} language="bash" />
            </div>

            {/* Step 2: Configure Kora */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Configure kora.toml
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create or update <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">kora-config/kora.toml</code> with your settings:
              </p>
              <CodeBlock code={`[server]
host = "127.0.0.1"
port = 8080

[solana]
rpc_url = "https://api.devnet.solana.com"
commitment = "confirmed"

# Token allowlist - Only these tokens can use gasless transactions
allowed_tokens = [
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",  # USDC devnet
  "So11111111111111111111111111111111111111112",   # SOL (native)
]

[signers]
config_path = "./kora-config/signers.toml"

[auth]
# API key for authentication (optional for development)
api_key = "your-secure-api-key"
enabled = false  # Set to true for production

[security]
require_api_key = false  # Set to true for production
allowed_origins = ["http://localhost:3000", "http://localhost:3001"]

[rate_limiting]
enabled = true
requests_per_second = 10`} language="toml" />
            </div>

            {/* Step 3: Generate Fee Payer */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Generate Fee Payer Keypair
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a keypair that will pay for gas fees:
              </p>
              <CodeBlock code={`# Create keypairs directory
mkdir -p kora-config/keypairs

# Generate keypair
solana-keygen new --outfile kora-config/keypairs/fee-payer.json

# Fund for devnet testing (get the pubkey first)
solana-keygen pubkey kora-config/keypairs/fee-payer.json

# Airdrop SOL for gas fees
solana airdrop 2 <YOUR_PUBKEY> --url devnet`} language="bash" />

              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Production:</strong> Fund this keypair with enough SOL to cover gas fees for your expected transaction volume.
                      Monitor balance and set up alerts for low balances.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Configure Signers */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Configure Signers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">kora-config/signers.toml</code>:
              </p>
              <CodeBlock code={`[[signer]]
name = "402pay-fee-payer"
keypair_path = "./kora-config/keypairs/fee-payer.json"
# Optional: Set a maximum amount this signer can spend per transaction
max_lamports_per_transaction = 10000000  # 0.01 SOL`} language="toml" />
            </div>

            {/* Step 5: Start Kora */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">5</span>
                Start Kora Server
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Run the Kora RPC server:
              </p>
              <CodeBlock code={`# From your 402pay root directory
kora-rpc --config ./kora-config/kora.toml

# You should see:
# [INFO] Kora RPC server starting
# [INFO] Loaded signer: 402pay-fee-payer
# [INFO] Allowed tokens: [USDC, SOL]
# [INFO] API auth: disabled (development mode)
# [INFO] Listening on http://127.0.0.1:8080`} language="bash" />
            </div>

            {/* Step 6: Configure 402pay */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">6</span>
                Configure 402pay Environment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update your <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">.env</code> file:
              </p>
              <CodeBlock code={`# Kora Configuration
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your-secure-api-key  # Must match kora.toml
KORA_FACILITATOR_URL=http://localhost:3001/x402/kora

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com`} language="bash" />
            </div>
          </div>
        </section>

        {/* Using Gasless in Code */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Using Gasless in Your Code</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Server-Side (Express)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enable gasless transactions by setting <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">useGasless: true</code>:
              </p>
              <CodeBlock code={`import express from 'express';
import { x402Middleware } from '@402pay/facilitator';

const app = express();

app.get('/api/premium-content',
  x402Middleware({
    amount: '1000000',  // 0.001 SOL
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'Premium content access',
    network: 'solana-devnet',
    useGasless: true,  // ✨ Enable gasless transactions
  }),
  (req, res) => {
    res.json({ content: 'Your premium data!' });
  }
);

app.listen(3001);`} />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Client-Side (React)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The SDK automatically uses Kora RPC when available:
              </p>
              <CodeBlock code={`import { useWallet } from '@solana/wallet-adapter-react';
import { x402Pay } from '@402pay/sdk';

function PaymentButton() {
  const wallet = useWallet();

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/premium-content', {
        method: 'GET',
      });

      if (response.status === 402) {
        const paymentInfo = response.headers.get('x402-payment-required');
        const details = JSON.parse(paymentInfo!);

        // SDK automatically uses Kora if facilitator supports it
        // User pays ZERO gas fees! 🎉
        const result = await x402Pay({
          amount: details.amount,
          recipient: details.payTo,
          network: details.network,
          facilitatorUrl: details.facilitatorUrl,
          wallet,
        });

        if (result.success) {
          // Retry with payment proof
          const content = await fetch('/api/premium-content', {
            headers: {
              'X-Payment-Signature': result.signature,
            },
          });
          const data = await content.json();
          console.log('Got content:', data);
        }
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <button onClick={handlePayment}>
      Access Premium Content (Zero Gas!)
    </button>
  );
}`} />
            </div>
          </div>
        </section>

        {/* Testing */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Testing Your Setup</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">1. Test Kora Health</h3>
              <CodeBlock code={`curl http://localhost:8080/health

# Expected response:
# {"status":"ok","version":"1.0.0"}`} language="bash" />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">2. Get Fee Payer Info</h3>
              <CodeBlock code={`curl -X POST http://localhost:8080 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getPayerSigner",
    "params": {}
  }'

# Expected response includes:
# {
#   "result": {
#     "address": "<FEE_PAYER_PUBKEY>",
#     "allowedTokens": [
#       "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
#       "So11111111111111111111111111111111111111112"
#     ]
#   }
# }`} language="bash" />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">3. Test 402pay Integration</h3>
              <CodeBlock code={`# Check Kora facilitator health
curl http://localhost:3001/x402/kora/health

# Expected response:
# {
#   "status": "ok",
#   "kora": {
#     "status": "ok",
#     "url": "http://localhost:8080",
#     "payerAddress": "<FEE_PAYER_PUBKEY>",
#     "allowedTokens": ["4zMMC9...", "So111..."]
#   }
# }`} language="bash" />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">4. End-to-End Test</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Make a real payment through your protected endpoint and verify the transaction on Solana Explorer.
                You should see the fee payer address as the transaction fee payer, not the user's wallet!
              </p>
            </div>
          </div>
        </section>

        {/* Monitoring */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Monitoring & Maintenance</h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                Monitor Fee Payer Balance
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Regularly check your fee payer's SOL balance:
              </p>
              <CodeBlock code={`# Check balance
solana balance <FEE_PAYER_PUBKEY> --url devnet

# Set up monitoring alerts when balance < 0.5 SOL
# Refill when needed to avoid transaction failures`} language="bash" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600 mr-3" />
                Track Gas Costs
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your gas expenditure to understand costs:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Track total transactions processed</li>
                <li>Calculate average gas cost per transaction</li>
                <li>Factor into pricing or operational costs</li>
                <li>Set up cost alerts for anomalies</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600 mr-3" />
                Security Best Practices
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Enable API key authentication in production (<code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-sm">enabled = true</code>)</li>
                <li>Use strong, randomly generated API keys</li>
                <li>Restrict CORS origins to your actual domains</li>
                <li>Set reasonable rate limits to prevent abuse</li>
                <li>Use <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-sm">max_lamports_per_transaction</code> to limit exposure</li>
                <li>Keep fee payer balance minimal (refill as needed)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>

          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <summary className="font-bold cursor-pointer text-lg">
                Transaction fails with "insufficient funds"
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                The fee payer keypair doesn't have enough SOL. Check balance and refill:
              </p>
              <CodeBlock code={`solana balance <FEE_PAYER_PUBKEY> --url devnet
solana airdrop 2 <FEE_PAYER_PUBKEY> --url devnet`} language="bash" />
            </details>

            <details className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <summary className="font-bold cursor-pointer text-lg">
                Transaction rejected: "token not in allowlist"
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                The payment token is not in your <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">allowed_tokens</code> list.
                Add the token mint address to <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">kora.toml</code> and restart Kora.
              </p>
            </details>

            <details className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <summary className="font-bold cursor-pointer text-lg">
                Cannot connect to Kora RPC
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Verify Kora is running and check your <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">KORA_RPC_URL</code> environment variable:
              </p>
              <CodeBlock code={`# Test Kora health
curl http://localhost:8080/health

# Check if KORA_RPC_URL matches your kora.toml [server] config`} language="bash" />
            </details>

            <details className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <summary className="font-bold cursor-pointer text-lg">
                API key authentication errors
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Ensure <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">KORA_API_KEY</code> in <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">.env</code> matches
                the <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">api_key</code> in <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">kora.toml</code>.
                For development, you can set <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">enabled = false</code> to disable authentication.
              </p>
            </details>
          </div>
        </section>

        {/* Production Checklist */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Production Deployment Checklist</h2>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Enable API key authentication (<code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-sm">enabled = true</code>)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Use strong, randomly generated API keys</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Update <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-sm">allowed_origins</code> to your production domains</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Switch to mainnet RPC URL and token mints</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Fund fee payer keypair with sufficient mainnet SOL</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Set up balance monitoring and alerts</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Configure reasonable rate limits</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Set <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-sm">max_lamports_per_transaction</code> limits</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Secure keypair files with proper permissions (600)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Test end-to-end on mainnet with small amounts first</span>
              </li>
            </ul>
          </div>
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
              href="/docs/sdk"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">SDK Documentation</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/x402-protocol"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">x402 Protocol Spec</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/agentforce"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">AgentForce Marketplace</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
