/**
 * Demo routes showing HTTP 402 Payment Required in action
 */

import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateNonce } from '@402pay/shared';

const router = Router();

// In-memory storage of validated payments (in production, use database)
const validatedPayments = new Set<string>();

/**
 * Demo protected endpoint - returns 402 if no payment proof
 * GET /demo/premium-data
 */
router.get('/premium-data', (req: AuthRequest, res) => {
  const paymentProof = req.headers['x-payment-proof'] as string;
  const paymentNonce = req.headers['x-payment-nonce'] as string;

  // Check if payment proof is provided
  if (!paymentProof || !paymentNonce) {
    // Return 402 Payment Required with payment details
    const nonce = generateNonce();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    return res.status(402).json({
      error: 'Payment Required',
      requirement: {
        amount: 0.001, // 0.001 SOL (~$0.0001 USD)
        currency: 'SOL',
        recipient: process.env.MERCHANT_WALLET || 'DemoMerchantWalletPublicKey123456789',
        resource: '/demo/premium-data',
        nonce,
        expiresAt,
        scheme: 'exact',
      },
      message: 'This endpoint requires payment. Include X-Payment-Proof and X-Payment-Nonce headers.',
    });
  }

  // Validate payment proof (simplified - in production, verify on-chain)
  const paymentKey = `${paymentProof}:${paymentNonce}`;

  // Check if already used (prevent replay attacks)
  if (validatedPayments.has(paymentKey)) {
    return res.status(409).json({
      error: 'Payment proof already used',
      message: 'Each payment can only be used once',
    });
  }

  // In production, you would:
  // 1. Verify the signature is a valid Solana transaction
  // 2. Check the transaction is confirmed on-chain
  // 3. Verify the amount and recipient match requirements
  // 4. Ensure the nonce matches and hasn't expired

  // For demo, we'll accept any proof and mark it as used
  validatedPayments.add(paymentKey);

  // Return the premium data
  res.json({
    success: true,
    data: {
      type: 'premium',
      content: {
        insights: [
          'AI agents processed 1.2M requests this week',
          'Average payment: 0.0015 SOL per API call',
          'Top service: OpenAI GPT-4 API proxying',
          '402pay enabled $12,000 in autonomous transactions',
        ],
        metrics: {
          totalAgents: 1247,
          totalRevenue: 45.6,
          averageResponseTime: 180,
          successRate: 99.7,
        },
        trend: {
          direction: 'up',
          percentage: 23.5,
          timeframe: 'week',
        },
      },
      timestamp: Date.now(),
    },
    message: 'Payment verified. Access granted to premium data.',
  });
});

/**
 * Free endpoint - no payment required
 * GET /demo/public-data
 */
router.get('/public-data', (req, res) => {
  res.json({
    success: true,
    data: {
      type: 'public',
      content: {
        info: '402pay is a payment protocol for AI agents',
        features: ['HTTP 402 support', 'Solana micropayments', 'Agent reputation', 'MCP integration'],
        status: 'operational',
      },
      timestamp: Date.now(),
    },
    message: 'Public data - no payment required',
  });
});

/**
 * Get payment statistics
 * GET /demo/stats
 */
router.get('/stats', (req, res) => {
  res.json({
    totalPayments: validatedPayments.size,
    message: 'Demo endpoint statistics',
  });
});

export { router as demoRouter };
