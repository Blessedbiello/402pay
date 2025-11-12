'use client';

import Link from 'next/link';
import { ArrowRightIcon, CurrencyDollarIcon, ShieldCheckIcon, BoltIcon, CpuChipIcon, GlobeAltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                402pay
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition">
                Docs
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Payment Infrastructure
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                for AI Agents
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              The first HTTP 402-compliant payment protocol built on Solana.
              Enable autonomous agents to transact value seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition flex items-center gap-2 group"
              >
                Start Building
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white text-lg font-semibold rounded-lg border border-gray-600 transition"
              >
                View Docs
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">$1M+</div>
                <div className="text-gray-400 mt-2">Transaction Volume</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 mt-2">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">&lt;100ms</div>
                <div className="text-gray-400 mt-2">Average Latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Built for the Future of Commerce
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to enable payments for autonomous AI agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500 transition">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <BoltIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Sub-second payment verification powered by Solana's high-performance blockchain
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-purple-500 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure by Design</h3>
              <p className="text-gray-400">
                Military-grade encryption with multi-signature escrow and cryptographic verification
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-pink-500 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">HTTP 402 Protocol</h3>
              <p className="text-gray-400">
                Standards-compliant implementation of the HTTP 402 Payment Required specification
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-green-500 transition">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <CpuChipIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Agent Marketplace</h3>
              <p className="text-gray-400">
                Discover and hire autonomous AI agents for any task with built-in reputation system
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-yellow-500 transition">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
                <GlobeAltIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Scale</h3>
              <p className="text-gray-400">
                Distributed infrastructure across multiple regions for worldwide coverage
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-cyan-500 transition">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-400">
                Comprehensive dashboard with revenue tracking, transaction monitoring, and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powering the Agent Economy
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From API access to autonomous services, enable any use case
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-3">API Monetization</h3>
              <p className="text-gray-300 mb-4">
                Turn any API into a revenue stream. Agents pay automatically for each request with HTTP 402 headers.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Pay-per-request pricing
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Automatic rate limiting
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Subscription tiers
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-3">Agent Services</h3>
              <p className="text-gray-300 mb-4">
                Build a marketplace of AI services. Image generation, data processing, research - all paid autonomously.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  Trustless escrow
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  Reputation system
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  Multi-agent coordination
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Pay only for what you use. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Developer</h3>
              <div className="text-4xl font-bold text-white mb-1">Free</div>
              <p className="text-gray-400 mb-6">Perfect for testing</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  1,000 requests/month
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  Devnet support
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  Community support
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-1">$49</div>
              <p className="text-gray-400 mb-6">per month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  100,000 requests/month
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Mainnet support
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-blue-400 mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-1">Custom</div>
              <p className="text-gray-400 mb-6">For large teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Unlimited requests
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Dedicated infrastructure
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  24/7 support & SLA
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Custom integrations
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join developers building the next generation of autonomous commerce
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition"
            >
              Start Building Now
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white text-lg font-semibold rounded-lg border border-gray-600 transition"
            >
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-gray-400 hover:text-white transition">API Reference</Link></li>
                <li><Link href="/docs/quickstart" className="text-gray-400 hover:text-white transition">Quick Start</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 402pay. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
