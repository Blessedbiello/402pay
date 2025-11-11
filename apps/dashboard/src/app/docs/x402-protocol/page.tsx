'use client';

import Link from 'next/link';
import { ChevronRight, Home, FileText, Shield, Zap, CheckCircle2, Code, Copy, Check } from 'lucide-react';
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

export default function X402ProtocolPage() {
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
              <Link href="https://github.com/coinbase/x402" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Official Spec
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
          <span className="text-gray-900 dark:text-white font-medium">x402 Protocol</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 font-medium mb-6">
            <Shield className="w-5 h-5" />
            <span>100% Spec Compliant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            x402 Protocol Specification
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Official Coinbase x402 protocol for HTTP 402 Payment Required.
            Standardized micropayments for the web using blockchain technology.
          </p>

          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Version 1.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Production Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Kora Extended</span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            x402 is a standardized protocol for HTTP 402 Payment Required responses. It enables servers to
            request cryptocurrency micropayments for API access, content, or services.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Standardized</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Official Coinbase specification ensures interoperability across implementations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Blockchain-verified payments with cryptographic signatures.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Supports multiple blockchains, tokens, and payment schemes.
              </p>
            </div>
          </div>
        </section>

        {/* Protocol Flow */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Protocol Flow</h2>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-6">
            <ol className="space-y-6">
              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Client Requests Resource</h3>
                  <CodeBlock code={`GET /api/premium-data HTTP/1.1
Host: api.example.com`} language="http" />
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Server Returns 402 Payment Required</h3>
                  <CodeBlock code={`HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "solana-devnet",
    "maxAmountRequired": "1000000",
    "payTo": "ABC...XYZ",
    "asset": "",
    "resource": "/api/premium-data",
    "description": "Premium data access",
    "mimeType": "application/json",
    "maxTimeoutSeconds": 60,
    "extra": null
  }]
}`} language="http" />
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Client Creates Payment</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Client creates a transaction on the specified blockchain (Solana, Base, etc.)
                    and sends payment proof in the X-PAYMENT header.
                  </p>
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Client Retries with Payment</h3>
                  <CodeBlock code={`GET /api/premium-data HTTP/1.1
Host: api.example.com
X-PAYMENT: eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoi...`} language="http" />
                </div>
              </li>

              <li className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Server Verifies & Returns Content</h3>
                  <CodeBlock code={`HTTP/1.1 200 OK
Content-Type: application/json
X-PAYMENT-RESPONSE: eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6...

{
  "data": "Your premium content"
}`} language="http" />
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Core Types */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Core Data Types</h2>

          <div className="space-y-8">
            {/* PaymentRequirements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">PaymentRequirements</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Defines the payment terms for accessing a resource. Returned in 402 responses.
              </p>

              <CodeBlock code={`interface PaymentRequirements {
  // Payment scheme identifier
  scheme: string;              // "exact" | "subscription" | "metered"

  // Blockchain network
  network: string;             // "solana-devnet" | "solana" | "base" | etc.

  // Maximum amount required (in smallest units)
  maxAmountRequired: string;   // e.g., "1000000" (0.001 SOL in lamports)

  // Token/asset identifier
  asset: string;               // SPL mint or ERC20 address (empty for native)

  // Recipient wallet address
  payTo: string;               // Wallet to receive payment

  // Resource path
  resource: string;            // e.g., "/api/premium-data"

  // Human-readable description
  description: string;         // e.g., "Premium data access"

  // Response MIME type
  mimeType?: string;           // e.g., "application/json"

  // Payment timeout in SECONDS (not milliseconds)
  maxTimeoutSeconds: number;   // e.g., 60

  // JSON schema for response
  outputSchema?: object | null;

  // Scheme-specific metadata
  extra?: object | null;
}`} language="typescript" />
            </div>

            {/* PaymentPayload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">PaymentPayload</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sent by client in X-PAYMENT header (base64-encoded JSON).
              </p>

              <CodeBlock code={`interface PaymentPayload {
  // Protocol version (number, not string)
  x402Version: number;        // 1

  // Payment scheme
  scheme: string;             // "exact"

  // Blockchain network
  network: string;            // "solana-devnet"

  // Blockchain-specific payment data
  payload: SolanaPaymentData | EVMPaymentData;
}

// For Solana payments
interface SolanaPaymentData {
  // Transaction signature (direct RPC flow)
  signature?: string;

  // Unsigned transaction (gasless Kora flow)
  unsigned_transaction?: string;

  // Payer public key
  from: string;

  // Recipient public key
  to: string;

  // Amount in smallest units
  amount: string;

  // SPL token mint (optional, omit for SOL)
  mint?: string;

  // Unix timestamp in milliseconds
  timestamp: number;

  // Additional metadata
  metadata?: Record<string, any>;
}`} language="typescript" />
            </div>

            {/* PaymentResponse */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-4">PaymentResponse</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sent by server in X-PAYMENT-RESPONSE header (base64-encoded JSON).
              </p>

              <CodeBlock code={`interface PaymentResponse {
  // Payment success status
  success: boolean;

  // Transaction hash/signature
  transaction: string;        // Blockchain tx hash

  // Network identifier
  network: string;            // "solana-devnet"

  // Payer address
  payer: string;              // Verified payer wallet

  // Error description (if failed)
  errorReason?: string;
}`} language="typescript" />
            </div>
          </div>
        </section>

        {/* HTTP Headers */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">HTTP Headers</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 font-semibold">Header Name</th>
                  <th className="text-left p-4 font-semibold">Direction</th>
                  <th className="text-left p-4 font-semibold">Format</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="p-4 font-mono font-bold">X-PAYMENT</td>
                  <td className="p-4">Request</td>
                  <td className="p-4 font-mono text-xs">base64(JSON)</td>
                  <td className="p-4">Payment payload from client</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold">X-PAYMENT-RESPONSE</td>
                  <td className="p-4">Response</td>
                  <td className="p-4 font-mono text-xs">base64(JSON)</td>
                  <td className="p-4">Payment confirmation from server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment Schemes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Payment Schemes</h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold">exact</h3>
                <span className="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">Supported</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                One-time payment for a specific amount. The client pays exactly the amount requested by the server.
                This is the most common scheme for micropayments and pay-per-use APIs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                <h3 className="text-2xl font-bold">subscription</h3>
                <span className="ml-auto px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">Future</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Recurring payments for ongoing access. Reserved for future versions of the x402 specification.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                <h3 className="text-2xl font-bold">metered</h3>
                <span className="ml-auto px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">Future</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Pay-as-you-go based on usage. Reserved for future versions of the x402 specification.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Networks */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Supported Networks</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Solana Mainnet</h3>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">Production</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Network ID: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">solana</code></p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sub-second transactions, low fees</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Solana Devnet</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Development</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Network ID: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">solana-devnet</code></p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Free testing environment</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Base (Coinbase L2)</h3>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">Production</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Network ID: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">base</code></p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ethereum L2, low fees</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Base Sepolia</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Development</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Network ID: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">base-sepolia</code></p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Base testnet</p>
            </div>
          </div>
        </section>

        {/* Kora Extension */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Zap className="w-8 h-8 text-yellow-600 mr-3" />
            Kora Gasless Extension
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            402pay extends x402 with Kora RPC support for gasless transactions. Users pay zero gas fees!
          </p>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-6">
            <h3 className="text-2xl font-bold mb-4">How It Works</h3>
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                <span>Client creates <strong>unsigned transaction</strong> instead of signing it</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                <span>Sends payload with <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-xs">unsigned_transaction</code> field</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                <span>Server forwards to Kora RPC for validation</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                <span>Kora signs as fee payer and submits to Solana</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
                <span>User pays ZERO gas fees!</span>
              </li>
            </ol>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4">Extended SolanaPaymentData</h3>
            <CodeBlock code={`interface SolanaPaymentData {
  // Direct RPC flow: transaction signature
  signature?: string;

  // Kora gasless flow: unsigned transaction
  unsigned_transaction?: string;  // ← Kora extension

  // Standard fields
  from: string;
  to: string;
  amount: string;
  mint?: string;
  timestamp: number;
}`} language="typescript" />
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Error Codes</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 font-semibold">Error Code</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="p-4 font-mono text-xs">INVALID_PAYMENT</td>
                  <td className="p-4">Payment payload is malformed or invalid</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">INSUFFICIENT_AMOUNT</td>
                  <td className="p-4">Payment amount is less than required</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">EXPIRED_PAYMENT</td>
                  <td className="p-4">Payment timestamp exceeds maxTimeoutSeconds</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">INVALID_SIGNATURE</td>
                  <td className="p-4">Cryptographic signature verification failed</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">INVALID_NETWORK</td>
                  <td className="p-4">Network mismatch between client and server</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">INVALID_SCHEME</td>
                  <td className="p-4">Unsupported payment scheme</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">SETTLEMENT_FAILED</td>
                  <td className="p-4">Transaction settlement failed on blockchain</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-xs">FACILITATOR_ERROR</td>
                  <td className="p-4">Facilitator service error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Compliance */}
        <section className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6">402pay Spec Compliance</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">✅ Fully Compliant</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>All field names match spec exactly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Uses <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-xs">payTo</code> (not recipient)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Uses <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-xs">accepts</code> array (not paymentRequirements)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Uses <code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-xs">maxTimeoutSeconds</code> in seconds</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>x402Version is number (not string)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">🚀 Extensions</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Kora gasless transaction support</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><code className="px-1 py-0.5 bg-white dark:bg-gray-900 rounded text-xs">unsigned_transaction</code> field</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Dual flow: direct RPC + gasless</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Zero gas fees for end users</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* What's Next */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/docs/quickstart"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Quick Start Guide</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs/api-reference"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">API Reference</span>
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
              href="https://github.com/coinbase/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <span className="font-semibold">Official x402 Spec</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
