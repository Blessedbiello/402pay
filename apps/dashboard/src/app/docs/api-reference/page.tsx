'use client';

import Link from 'next/link';
import { ChevronRight, Home, Book, Code2, Server, Workflow, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
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

export default function APIReferencePage() {
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
          <span className="text-gray-900 dark:text-white font-medium">API Reference</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 font-medium mb-6">
            <Book className="w-5 h-5" />
            <span>Complete API Reference</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            API Reference
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Complete reference for all 402pay APIs, middleware, SDKs, and protocol specifications.
          </p>
        </div>

        {/* Table of Contents */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">On This Page</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="#middleware-api" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Server className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-semibold">Middleware API</span>
            </a>
            <a href="#x402-client" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Code2 className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-semibold">x402 Client API</span>
            </a>
            <a href="#http-protocol" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <Workflow className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-semibold">HTTP Protocol</span>
            </a>
            <a href="#errors" className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="font-semibold">Error Handling</span>
            </a>
          </div>
        </section>

        {/* Middleware API */}
        <section id="middleware-api" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Server className="w-8 h-8 text-blue-600 mr-3" />
            Middleware API
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Express/Connect middleware for protecting endpoints with x402 payments.
          </p>

          {/* x402Middleware */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="text-2xl font-bold mb-4 font-mono">x402Middleware(config)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Creates middleware that requires payment before allowing access to an endpoint.
              </p>

              <h4 className="font-bold text-lg mb-3">Parameters</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <th className="text-left p-3 font-semibold">Parameter</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Required</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-3 font-mono text-xs">amount</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">Yes</span></td>
                      <td className="p-3">Payment amount in lamports or token smallest units</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">payTo</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">Yes</span></td>
                      <td className="p-3">Recipient wallet address</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">description</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">Yes</span></td>
                      <td className="p-3">Human-readable description of the resource</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">network</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Network identifier (default: "solana-devnet")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">asset</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">SPL token mint address (omit for native SOL)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">maxTimeoutSeconds</td>
                      <td className="p-3 font-mono text-xs">number</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Payment timeout in seconds (default: 60)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">useGasless</td>
                      <td className="p-3 font-mono text-xs">boolean</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Enable Kora gasless transactions (default: false)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">facilitatorUrl</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Kora facilitator URL for gasless payments</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">mimeType</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">MIME type of response (default: "application/json")</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">extra</td>
                      <td className="p-3 font-mono text-xs">object</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Additional metadata for the payment</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">outputSchema</td>
                      <td className="p-3 font-mono text-xs">object</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">JSON schema for expected response</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-bold text-lg mb-3">Example</h4>
              <CodeBlock code={`import express from 'express';
import { x402Middleware } from '@402pay/facilitator';

const app = express();

// Basic usage
app.get('/api/premium-data',
  x402Middleware({
    amount: '1000000',  // 0.001 SOL
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'Premium data access',
  }),
  (req, res) => {
    res.json({ data: 'Your premium content!' });
  }
);

// With gasless transactions
app.get('/api/gasless-endpoint',
  x402Middleware({
    amount: '500000',  // 0.0005 SOL
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'Gasless premium endpoint',
    useGasless: true,  // Enable gasless via Kora
    maxTimeoutSeconds: 120,
  }),
  (req, res) => {
    res.json({ message: 'Zero gas fees!' });
  }
);

// SPL token payment
app.get('/api/usdc-endpoint',
  x402Middleware({
    amount: '1000000',  // 1 USDC (6 decimals)
    payTo: process.env.PAYMENT_RECIPIENT_ADDRESS!,
    description: 'USDC payment endpoint',
    asset: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',  // USDC devnet
  }),
  (req, res) => {
    res.json({ status: 'paid with USDC' });
  }
);

app.listen(3001);`} />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> The middleware automatically handles both direct RPC verification (user pays gas)
                    and gasless verification (Kora pays gas) based on the payment payload type.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* x402 Client API */}
        <section id="x402-client" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Code2 className="w-8 h-8 text-purple-600 mr-3" />
            x402 Client API
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Client-side SDK for making payments to x402-protected endpoints.
          </p>

          {/* X402Client Constructor */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="text-2xl font-bold mb-4 font-mono">new X402Client(config)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new x402 client instance for making paid requests.
              </p>

              <h4 className="font-bold text-lg mb-3">Parameters</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <th className="text-left p-3 font-semibold">Parameter</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Required</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-3 font-mono text-xs">payer</td>
                      <td className="p-3 font-mono text-xs">Keypair | Uint8Array</td>
                      <td className="p-3"><span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">Yes</span></td>
                      <td className="p-3">Wallet that will pay for transactions</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">rpcUrl</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Solana RPC URL (default: devnet)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">network</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">No</span></td>
                      <td className="p-3">Network identifier (default: "solana-devnet")</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-bold text-lg mb-3">Example</h4>
              <CodeBlock code={`import { X402Client } from '@402pay/sdk';
import { Keypair } from '@solana/web3.js';

// From keypair
const wallet = Keypair.generate();
const client = new X402Client({
  payer: wallet,
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'solana-devnet',
});

// From secret key
const secretKey = new Uint8Array([...]); // Your wallet secret key
const client2 = new X402Client({
  payer: secretKey,
});`} />
            </div>
          </div>

          {/* paidRequest Method */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="text-2xl font-bold mb-4 font-mono">client.paidRequest(url, options?)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Make a request to an x402-protected endpoint. Automatically handles payment flow.
              </p>

              <h4 className="font-bold text-lg mb-3">Parameters</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <th className="text-left p-3 font-semibold">Parameter</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="p-3 font-mono text-xs">url</td>
                      <td className="p-3 font-mono text-xs">string</td>
                      <td className="p-3">URL of the x402-protected endpoint</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">options</td>
                      <td className="p-3 font-mono text-xs">RequestInit</td>
                      <td className="p-3">Fetch options (headers, method, etc.)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-bold text-lg mb-3">Returns</h4>
              <CodeBlock code={`{
  data: any;                    // Response data from endpoint
  payment: {
    signature: string;           // Transaction signature
    amount: string;              // Payment amount
    from: string;                // Payer address
    to: string;                  // Recipient address
  };
  response: {
    success: boolean;            // Payment success status
    transaction?: string;        // Transaction ID (optional)
    network?: string;            // Network used
    payer?: string;              // Payer address
  };
}`} language="typescript" />

              <h4 className="font-bold text-lg mb-3 mt-6">Example</h4>
              <CodeBlock code={`const client = new X402Client({ payer: wallet });

// Make paid request - handles payment automatically!
const result = await client.paidRequest('http://localhost:3001/api/premium-data');

console.log('Got data:', result.data);
console.log('Payment signature:', result.payment.signature);
console.log('Paid amount:', result.payment.amount);`} />
            </div>
          </div>

          {/* getPaymentRequirements Method */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="text-2xl font-bold mb-4 font-mono">client.getPaymentRequirements(url, options?)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get payment requirements for an endpoint without making payment. Useful for displaying price to users.
              </p>

              <h4 className="font-bold text-lg mb-3">Returns</h4>
              <CodeBlock code={`{
  requirements: {
    x402Version: number;
    accepts: PaymentRequirement[];
  };
  priceInSOL: number;           // Price in SOL
  priceInLamports: string;      // Price in lamports
}`} language="typescript" />

              <h4 className="font-bold text-lg mb-3 mt-6">Example</h4>
              <CodeBlock code={`const { priceInSOL, requirements } = await client.getPaymentRequirements(
  'http://localhost:3001/api/premium-data'
);

console.log(\`Price: \${priceInSOL} SOL\`);
console.log('Accepts:', requirements.accepts);

// Display to user before payment
if (confirm(\`Pay \${priceInSOL} SOL?\`)) {
  const result = await client.paidRequest('http://localhost:3001/api/premium-data');
  console.log(result.data);
}`} />
            </div>
          </div>

          {/* Other Methods */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Additional Methods</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg font-mono mb-2">client.checkBalance(requiredLamports)</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Check if payer has sufficient balance for a payment.
                  </p>
                  <CodeBlock code={`const balance = await client.checkBalance('1000000');
if (!balance.hasEnough) {
  console.log(\`Need \${balance.shortfall} more lamports\`);
}`} />
                </div>

                <div className="mt-6">
                  <h4 className="font-bold text-lg font-mono mb-2">client.getBalance()</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Get payer's current SOL balance.
                  </p>
                  <CodeBlock code={`const balanceSOL = await client.getBalance();
console.log(\`Balance: \${balanceSOL} SOL\`);`} />
                </div>

                <div className="mt-6">
                  <h4 className="font-bold text-lg font-mono mb-2">client.getPublicKey()</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Get payer's public key.
                  </p>
                  <CodeBlock code={`const pubkey = client.getPublicKey();
console.log('Payer:', pubkey.toBase58());`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HTTP Protocol */}
        <section id="http-protocol" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Workflow className="w-8 h-8 text-green-600 mr-3" />
            HTTP Protocol
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            x402 protocol uses HTTP headers and status codes to implement payment requirements.
          </p>

          {/* Status Codes */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Status Codes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="text-left p-4 font-semibold">Status Code</th>
                    <th className="text-left p-4 font-semibold">Meaning</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="p-4 font-mono font-bold">402</td>
                    <td className="p-4 font-semibold">Payment Required</td>
                    <td className="p-4">Returned when payment is needed or invalid</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono font-bold">200</td>
                    <td className="p-4 font-semibold">OK</td>
                    <td className="p-4">Payment verified, content delivered</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono font-bold">400</td>
                    <td className="p-4 font-semibold">Bad Request</td>
                    <td className="p-4">Malformed payment payload</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* HTTP Headers */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">HTTP Headers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="text-left p-4 font-semibold">Header</th>
                    <th className="text-left p-4 font-semibold">Direction</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="p-4 font-mono text-xs">X-PAYMENT</td>
                    <td className="p-4">Request</td>
                    <td className="p-4">Base64-encoded payment payload from client</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">X-PAYMENT-RESPONSE</td>
                    <td className="p-4">Response</td>
                    <td className="p-4">Base64-encoded payment confirmation from server</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 402 Response Format */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">402 Response Format</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When payment is required, the server responds with status 402 and this JSON body:
            </p>
            <CodeBlock code={`{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "solana-devnet",
      "maxAmountRequired": "1000000",
      "payTo": "ABC...XYZ",
      "asset": "",
      "resource": "/api/premium-data",
      "description": "Premium data access",
      "mimeType": "application/json",
      "maxTimeoutSeconds": 60,
      "outputSchema": null,
      "extra": null
    }
  ],
  "error": "Payment required"  // Optional error message
}`} language="json" />
          </div>

          {/* X-PAYMENT Header Format */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">X-PAYMENT Header Format</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Client sends payment proof in the X-PAYMENT header (base64-encoded JSON):
            </p>
            <CodeBlock code={`// Decoded payload structure
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "solana-devnet",
  "payload": {
    "signature": "5Kn...",      // Transaction signature (direct RPC)
    "unsigned_transaction": "...", // Unsigned tx (gasless)
    "from": "ABC...XYZ",          // Payer address
    "to": "DEF...UVW",            // Recipient address
    "amount": "1000000",          // Amount paid
    "mint": "...",                // Token mint (optional)
    "timestamp": 1234567890       // Payment timestamp
  }
}

// Sent as base64
X-PAYMENT: eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoi...`} language="json" />
          </div>
        </section>

        {/* Error Handling */}
        <section id="errors" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            Error Handling
          </h2>

          <div className="space-y-6">
            {/* Common Errors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Common Errors</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold mb-1">Insufficient amount</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment amount is less than required. Check the <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">maxAmountRequired</code> field.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold mb-1">Network mismatch</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment network doesn't match endpoint requirements. Ensure client and server use same network.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold mb-1">Transaction not found</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transaction signature not found on blockchain. Wait for confirmation before retrying.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold mb-1">Payment expired</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment timestamp exceeds <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">maxTimeoutSeconds</code>. Create a new payment.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-bold mb-1">Recipient mismatch</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment was sent to wrong address. Verify <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">payTo</code> matches.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-bold mb-1">Facilitator verification failed</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gasless payment verification failed. Check Kora RPC is running and accessible.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Handling Example */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Error Handling Example</h3>
              <CodeBlock code={`import { X402Client } from '@402pay/sdk';

const client = new X402Client({ payer: wallet });

try {
  const result = await client.paidRequest('http://localhost:3001/api/data');
  console.log('Success:', result.data);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough SOL in wallet');
    // Show airdrop/deposit UI
  } else if (error.message.includes('Network mismatch')) {
    console.error('Wrong network - check client config');
  } else if (error.message.includes('Transaction not found')) {
    console.error('Transaction pending - wait and retry');
    // Retry with exponential backoff
  } else if (error.message.includes('Payment expired')) {
    console.error('Payment took too long - create new payment');
    // Retry from beginning
  } else {
    console.error('Unknown error:', error);
  }
}`} />
            </div>
          </div>
        </section>

        {/* Type Definitions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">TypeScript Type Definitions</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All types are exported from <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">@402pay/shared</code>.
          </p>

          <CodeBlock code={`import {
  // Version
  X402_SPEC_VERSION,          // Current spec version (1)

  // HTTP
  X402_HTTP_HEADERS,          // Header constants
  X402_HTTP_STATUS,           // Status code constants

  // Types
  PaymentRequirements,        // Payment requirement object
  PaymentRequirementsResponse, // 402 response body
  PaymentPayload,             // X-PAYMENT header payload
  PaymentResponse,            // X-PAYMENT-RESPONSE header
  SolanaPaymentData,          // Solana-specific payment data
  VerifyResponse,             // Facilitator verify response

  // Guards
  isSolanaPaymentData,        // Type guard for Solana payments
} from '@402pay/shared';`} language="typescript" />
        </section>

        {/* What's Next */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/docs/sdk"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">SDK Documentation</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/kora-gasless"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Kora Gasless Guide</span>
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
              href="/docs/quickstart"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Quick Start Guide</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
