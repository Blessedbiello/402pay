'use client';

import Link from 'next/link';
import { Book, Zap, Code, Rocket, Shield, Globe } from 'lucide-react';

export default function DocsPage() {
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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="https://github.com/Blessedbiello/402pay" target="_blank" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to integrate 402pay into your application
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link href="/docs/quickstart" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quick Start</h3>
            <p className="text-gray-600 dark:text-gray-400">Get up and running in 5 minutes</p>
          </Link>

          <Link href="/docs/x402-protocol" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">x402 Protocol</h3>
            <p className="text-gray-600 dark:text-gray-400">Understand HTTP 402 Payment Required</p>
          </Link>

          <Link href="/docs/kora-gasless" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-500">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Kora Gasless</h3>
            <p className="text-gray-600 dark:text-gray-400">Zero gas fees for your users</p>
          </Link>

          <Link href="/docs/api-reference" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">API Reference</h3>
            <p className="text-gray-600 dark:text-gray-400">Complete API documentation</p>
          </Link>

          <Link href="/docs/sdk" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-500">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">SDK Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400">TypeScript SDK guide</p>
          </Link>

          <Link href="/docs/agentforce" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AgentForce</h3>
            <p className="text-gray-600 dark:text-gray-400">AI agent marketplace guide</p>
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Getting Started */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/installation" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Installation →
                </Link>
              </li>
              <li>
                <Link href="/docs/quickstart" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Quick Start Guide →
                </Link>
              </li>
              <li>
                <Link href="/docs/configuration" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Configuration →
                </Link>
              </li>
              <li>
                <Link href="/docs/authentication" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Authentication →
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Concepts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/x402-protocol" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  x402 Protocol →
                </Link>
              </li>
              <li>
                <Link href="/docs/payment-flows" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Payment Flows →
                </Link>
              </li>
              <li>
                <Link href="/docs/facilitators" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Facilitators →
                </Link>
              </li>
              <li>
                <Link href="/docs/subscriptions" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Subscriptions →
                </Link>
              </li>
            </ul>
          </div>

          {/* Advanced Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/kora-gasless" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Kora Gasless Transactions →
                </Link>
              </li>
              <li>
                <Link href="/docs/escrow" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Escrow System →
                </Link>
              </li>
              <li>
                <Link href="/docs/webhooks" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Webhooks →
                </Link>
              </li>
              <li>
                <Link href="/docs/analytics" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Analytics & Reporting →
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides & Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Guides & Examples</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/examples/paid-api" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Building a Paid API →
                </Link>
              </li>
              <li>
                <Link href="/docs/examples/subscription-service" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Subscription Service →
                </Link>
              </li>
              <li>
                <Link href="/docs/examples/ai-agent" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  AI Agent Integration →
                </Link>
              </li>
              <li>
                <Link href="/docs/agentforce" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  AgentForce Marketplace →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need help?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our community or check out the examples to see 402pay in action
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://github.com/Blessedbiello/402pay" target="_blank" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all">
              View on GitHub
            </Link>
            <Link href="/docs/examples" className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all">
              Browse Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
