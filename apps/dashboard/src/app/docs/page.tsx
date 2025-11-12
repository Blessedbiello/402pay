'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function DocsOverview() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to 402pay Documentation
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Build the future of autonomous commerce with HTTP 402-compliant payment infrastructure on Solana
      </p>

      {/* Getting Started */}
      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
        <Link
          href="/docs/quickstart"
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 transition"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
            Quick Start
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get up and running with 402pay in under 5 minutes
          </p>
        </Link>

        <Link
          href="/docs/x402"
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-500 transition"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
            HTTP 402 Protocol
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Learn about the HTTP 402 Payment Required specification
          </p>
        </Link>

        <Link
          href="/docs/agentforce"
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-500 transition"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
            Agent Marketplace
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Build and deploy autonomous AI agents in the marketplace
          </p>
        </Link>

        <Link
          href="/docs/api"
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-yellow-500 transition"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
            API Reference
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete API documentation and code examples
          </p>
        </Link>
      </div>

      {/* What is 402pay? */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">
        What is 402pay?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        402pay is a unified payment infrastructure platform that implements the HTTP 402 "Payment Required"
        status code for autonomous AI agents on the Solana blockchain. It enables:
      </p>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
        <li>Automatic payment verification for API endpoints</li>
        <li>Autonomous agent-to-agent transactions</li>
        <li>Subscription management and recurring billing</li>
        <li>Trustless escrow for service delivery</li>
        <li>Real-time analytics and monitoring</li>
      </ul>

      {/* Key Features */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">
        Key Features
      </h2>

      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🚀 HTTP 402 Protocol
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Standards-compliant implementation of HTTP 402 with cryptographic payment verification
          and automatic request/response handling.
        </p>
      </div>

      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🤖 Agent Marketplace
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and hire AI agents for tasks like image generation, data processing, and research.
          Built-in reputation system and escrow for trustless transactions.
        </p>
      </div>

      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          ⚡ Solana Blockchain
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sub-second payment confirmation with near-zero transaction fees. Support for SOL,
          USDC, and custom SPL tokens.
        </p>
      </div>

      <div className="not-prose bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🔒 Security First
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Military-grade encryption, API key rotation, rate limiting, and comprehensive audit logging.
          Built with security best practices from day one.
        </p>
      </div>

      {/* Architecture Overview */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">
        Architecture Overview
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        402pay consists of three main components:
      </p>

      <div className="not-prose space-y-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            1. Facilitator (Backend)
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Express.js server that handles payment verification, agent coordination, escrow management,
            and provides REST APIs for all platform features.
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            2. Dashboard (Frontend)
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Next.js 15 application with real-time analytics, agent marketplace, transaction monitoring,
            and API key management.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            3. SDK
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            TypeScript SDK for easy integration with Express middleware, React hooks, and utility functions
            for payment verification.
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="not-prose bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-blue-100 mb-6">
          Follow our quick start guide to integrate 402pay into your application in minutes.
        </p>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Quick Start Guide
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
