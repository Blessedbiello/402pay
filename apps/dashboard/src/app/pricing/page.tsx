'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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
              <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Pay only for what you use. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Perfect for testing and development</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Up to 1,000 transactions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Devnet support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Community support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>x402 protocol access</span>
                </li>
              </ul>

              <Link
                href="/docs/quickstart"
                className="block w-full py-3 px-6 text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-blue-100 mb-4">For growing businesses</p>
                <div className="flex items-baseline text-white">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-blue-100 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Up to 100,000 transactions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Mainnet support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Kora gasless transactions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Subscription management</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Webhook notifications</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom branding</span>
                </li>
              </ul>

              <Link
                href="/dashboard"
                className="block w-full py-3 px-6 text-center bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">For large-scale operations</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">Custom</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Unlimited transactions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Dedicated infrastructure</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>99.99% SLA guarantee</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>24/7 phone & Slack support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>White-label options</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Custom contract terms</span>
                </li>
              </ul>

              <Link
                href="mailto:contact@402pay.com"
                className="block w-full py-3 px-6 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-2">How is transaction volume calculated?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Each successful payment counts as one transaction. Failed or rejected payments don't count.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">What are the transaction fees?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We don't charge any transaction fees. You only pay the subscription price. However, Solana network
                fees (gas) still apply unless you use Kora gasless transactions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">What happens if I exceed my transaction limit?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your service continues to work. You'll be automatically upgraded to the next tier or charged
                for overage at $0.0005 per additional transaction.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Is there a free trial for Pro?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All new Pro accounts get 14 days free. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, USDC, and SOL. Enterprise customers can pay via invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Start accepting payments in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/quickstart"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Building</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="mailto:contact@402pay.com"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg text-lg font-semibold hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
