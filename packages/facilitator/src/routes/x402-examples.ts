/**
 * x402 Protocol Example Routes
 * Demonstrates proper HTTP 402 Payment Required implementation
 */

import { Router } from 'express';
import { x402Middleware, X402Request } from '../middleware/x402';
import { publicRateLimiter } from '../middleware/rate-limit';

const router = Router();

// Your demo wallet address (replace with actual)
const DEMO_RECIPIENT = process.env.DEMO_WALLET_ADDRESS || 'DemoWalletAddressHere123456789';

/**
 * Example 1: Simple paid endpoint
 * Requires 0.001 SOL (1M lamports) for access
 *
 * Try:
 * curl http://localhost:3001/x402/paid-greeting
 * -> Returns 402 with payment requirements
 *
 * curl -H "X-PAYMENT: <base64_payment>" http://localhost:3001/x402/paid-greeting
 * -> Returns 200 with greeting
 */
router.get(
  '/paid-greeting',
  publicRateLimiter,
  x402Middleware({
    amount: '1000000', // 0.001 SOL = 1M lamports
    recipient: DEMO_RECIPIENT,
    description: 'Access to premium greeting service',
    mimeType: 'application/json',
  }),
  (req: X402Request, res) => {
    // Payment verified by middleware
    const payment = req.x402Payment;

    res.json({
      message: 'Hello from paid endpoint!',
      greeting: '👋 Welcome to x402 on Solana',
      payment: {
        from: payment?.payload.from,
        amount: payment?.payload.amount,
        signature: payment?.payload.signature,
      },
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * Example 2: Premium data endpoint
 * Requires 0.005 SOL for market data
 */
router.get(
  '/paid-data',
  publicRateLimiter,
  x402Middleware({
    amount: '5000000', // 0.005 SOL
    recipient: DEMO_RECIPIENT,
    description: 'Premium market data access',
    mimeType: 'application/json',
  }),
  (req: X402Request, res) => {
    // Simulate premium data
    const marketData = {
      symbol: 'SOL/USD',
      price: 142.35,
      change24h: 5.67,
      volume24h: 2450000000,
      high24h: 145.20,
      low24h: 138.50,
      lastUpdate: new Date().toISOString(),
    };

    res.json({
      data: marketData,
      meta: {
        paid: true,
        amount: req.x402Payment?.payload.amount,
        payer: req.x402Payment?.payload.from,
      },
    });
  }
);

/**
 * Example 3: AI Agent service endpoint
 * Demonstrates micro-payment for AI inference
 */
router.post(
  '/paid-inference',
  publicRateLimiter,
  x402Middleware({
    amount: '10000000', // 0.01 SOL
    recipient: DEMO_RECIPIENT,
    description: 'AI inference service - GPT-4 quality responses',
    mimeType: 'application/json',
    timeout: 300000, // 5 minutes
  }),
  (req: X402Request, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt in request body',
      });
    }

    // Simulate AI response (in production, call actual AI service)
    const response = {
      prompt,
      completion: `This is a simulated AI response to: "${prompt}". In production, this would call GPT-4 or Claude.`,
      model: 'gpt-4-simulated',
      tokens: {
        prompt: prompt.split(' ').length,
        completion: 50,
        total: prompt.split(' ').length + 50,
      },
      cost: {
        amount: req.x402Payment?.payload.amount,
        currency: 'lamports',
        usd: '0.01',
      },
      payment: {
        signature: req.x402Payment?.payload.signature,
        from: req.x402Payment?.payload.from,
      },
    };

    res.json(response);
  }
);

/**
 * Example 4: Image generation service
 * Requires 0.02 SOL for AI image generation
 */
router.post(
  '/paid-image',
  publicRateLimiter,
  x402Middleware({
    amount: '20000000', // 0.02 SOL
    recipient: DEMO_RECIPIENT,
    description: 'AI image generation service - DALL-E quality',
    mimeType: 'application/json',
  }),
  (req: X402Request, res) => {
    const { prompt, size = '1024x1024' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt in request body',
      });
    }

    // Simulate image generation response
    const response = {
      prompt,
      imageUrl: `https://placeholder.com/ai-generated/${size}?text=${encodeURIComponent(
        prompt
      )}`,
      size,
      model: 'dall-e-3-simulated',
      cost: {
        amount: req.x402Payment?.payload.amount,
        currency: 'lamports',
        usd: '0.02',
      },
      payment: {
        signature: req.x402Payment?.payload.signature,
        from: req.x402Payment?.payload.from,
        timestamp: req.x402Payment?.payload.timestamp,
      },
      generated: new Date().toISOString(),
    };

    res.json(response);
  }
);

/**
 * Example 5: Paid API proxy
 * Demonstrates agent-to-agent payment for API access
 */
router.get(
  '/paid-proxy/:service',
  publicRateLimiter,
  x402Middleware({
    amount: '2000000', // 0.002 SOL
    recipient: DEMO_RECIPIENT,
    description: 'Proxy access to premium APIs',
    mimeType: 'application/json',
  }),
  (req: X402Request, res) => {
    const { service } = req.params;

    // Simulate proxying to different services
    const services: Record<string, any> = {
      weather: {
        service: 'weather',
        data: {
          temperature: 72,
          condition: 'Sunny',
          humidity: 45,
          windSpeed: 10,
        },
      },
      stocks: {
        service: 'stocks',
        data: {
          SPY: 485.32,
          QQQ: 398.21,
          SOL: 142.35,
        },
      },
      crypto: {
        service: 'crypto',
        data: {
          BTC: 97250,
          ETH: 3850,
          SOL: 142.35,
        },
      },
    };

    const data = services[service] || {
      error: 'Service not found',
      availableServices: Object.keys(services),
    };

    res.json({
      ...data,
      payment: {
        amount: req.x402Payment?.payload.amount,
        signature: req.x402Payment?.payload.signature,
      },
    });
  }
);

/**
 * Info endpoint (free) - explains the x402 examples
 */
router.get('/', publicRateLimiter, (req, res) => {
  res.json({
    message: 'x402 Protocol Examples',
    description:
      'These endpoints demonstrate proper HTTP 402 Payment Required implementation on Solana',
    endpoints: [
      {
        path: '/x402/paid-greeting',
        method: 'GET',
        price: '0.001 SOL',
        description: 'Simple greeting service',
      },
      {
        path: '/x402/paid-data',
        method: 'GET',
        price: '0.005 SOL',
        description: 'Premium market data',
      },
      {
        path: '/x402/paid-inference',
        method: 'POST',
        price: '0.01 SOL',
        description: 'AI inference service',
        body: { prompt: 'Your question here' },
      },
      {
        path: '/x402/paid-image',
        method: 'POST',
        price: '0.02 SOL',
        description: 'AI image generation',
        body: { prompt: 'Image description', size: '1024x1024' },
      },
      {
        path: '/x402/paid-proxy/:service',
        method: 'GET',
        price: '0.002 SOL',
        description: 'Proxy to premium APIs',
        services: ['weather', 'stocks', 'crypto'],
      },
    ],
    usage: {
      step1: 'Call endpoint without payment to get 402 response with requirements',
      step2: 'Create payment on Solana blockchain',
      step3: 'Encode payment details as base64 JSON',
      step4: 'Retry request with X-PAYMENT header',
      step5: 'Receive 200 OK with content and X-PAYMENT-RESPONSE header',
    },
    protocol: {
      version: '0.1.0',
      spec: 'https://github.com/coinbase/x402',
      headers: {
        request: 'X-PAYMENT',
        response: 'X-PAYMENT-RESPONSE',
      },
    },
    network: 'solana-devnet',
    recipient: DEMO_RECIPIENT,
  });
});

export const x402ExamplesRouter = router;
