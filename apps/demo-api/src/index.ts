/**
 * Demo API - Showcasing 402pay Integration
 *
 * This demo shows how easy it is to add x402 payments to any API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SolPay402, createPaymentMiddleware } from '@402pay/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize 402pay SDK
const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY || 'demo_key',
  network: 'devnet',
  facilitatorUrl: process.env.FACILITATOR_URL || 'http://localhost:3001',
});

// Middleware
app.use(cors());
app.use(express.json());

// Public endpoint (no payment required)
app.get('/', (req, res) => {
  res.json({
    name: '402pay Demo API',
    description: 'Demo API showcasing x402 payment integration',
    endpoints: {
      public: [
        { path: '/', description: 'API info (free)' },
        { path: '/health', description: 'Health check (free)' },
      ],
      paid: [
        { path: '/api/crypto-price', price: '0.01 USDC', description: 'Real-time crypto prices' },
        { path: '/api/market-data', price: '0.05 USDC', description: 'Advanced market analytics' },
        { path: '/api/ai-insights', price: '0.10 USDC', description: 'AI-powered market insights' },
      ],
    },
    integration: {
      sdk: '@402pay/sdk',
      documentation: 'https://github.com/yourusername/402pay',
    },
  });
});

// Health check (free)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Protected endpoint: Crypto price (0.01 USDC)
app.get(
  '/api/crypto-price',
  createPaymentMiddleware(solpay, {
    price: 0.01,
    currency: 'USDC',
    resource: '/api/crypto-price',
  }),
  (req, res) => {
    // Mock crypto price data
    res.json({
      data: {
        SOL: {
          price: 143.52,
          change24h: 5.23,
          volume24h: 2.1e9,
        },
        BTC: {
          price: 67423.12,
          change24h: 2.15,
          volume24h: 28.5e9,
        },
        ETH: {
          price: 3245.67,
          change24h: 3.87,
          volume24h: 15.2e9,
        },
      },
      timestamp: Date.now(),
      provider: '402pay Demo API',
    });
  }
);

// Protected endpoint: Market data (0.05 USDC)
app.get(
  '/api/market-data',
  createPaymentMiddleware(solpay, {
    price: 0.05,
    currency: 'USDC',
    resource: '/api/market-data',
  }),
  (req, res) => {
    // Mock advanced market data
    res.json({
      data: {
        trending: [
          { symbol: 'SOL', rank: 1, score: 95 },
          { symbol: 'BONK', rank: 2, score: 87 },
          { symbol: 'JUP', rank: 3, score: 82 },
        ],
        topGainers: [
          { symbol: 'WIF', change: 23.5 },
          { symbol: 'PYTH', change: 18.2 },
          { symbol: 'RNDR', change: 15.7 },
        ],
        marketSentiment: {
          bullish: 65,
          neutral: 25,
          bearish: 10,
        },
        volumeAnalysis: {
          total24h: 45.2e9,
          dexVolume: 12.3e9,
          cexVolume: 32.9e9,
        },
      },
      timestamp: Date.now(),
      provider: '402pay Demo API - Premium Data',
    });
  }
);

// Protected endpoint: AI insights (0.10 USDC)
app.get(
  '/api/ai-insights',
  createPaymentMiddleware(solpay, {
    price: 0.1,
    currency: 'USDC',
    resource: '/api/ai-insights',
  }),
  (req, res) => {
    // Mock AI-powered insights
    res.json({
      data: {
        prediction: {
          asset: 'SOL',
          timeframe: '24h',
          direction: 'bullish',
          confidence: 0.78,
          targetPrice: 152.0,
        },
        technicalAnalysis: {
          rsi: 62,
          macd: 'bullish',
          movingAverages: {
            ma50: 'above',
            ma200: 'above',
          },
          support: 138.5,
          resistance: 148.2,
        },
        sentiment: {
          social: 0.72,
          news: 0.68,
          onChain: 0.81,
        },
        recommendation: 'BUY',
        reasoning:
          'Strong on-chain metrics, positive social sentiment, and bullish technical indicators suggest upward momentum.',
      },
      timestamp: Date.now(),
      model: 'GPT-4 Market Analysis',
      provider: '402pay Demo API - AI Premium',
    });
  }
);

// Example: Subscription-based endpoint (check if user has active subscription)
app.get(
  '/api/premium/realtime',
  async (req, res) => {
    // In a real app, you'd check subscription status from the database
    // For demo, we'll just require the X-PAYMENT header
    const xPayment = req.headers['x-payment'];

    if (!xPayment) {
      return res.status(402).json({
        error: 'Premium subscription required',
        plans: [
          { id: 'basic', price: 5.0, currency: 'USDC', period: 'month' },
          { id: 'pro', price: 20.0, currency: 'USDC', period: 'month' },
        ],
      });
    }

    res.json({
      data: {
        stream: 'wss://realtime.402pay.demo/premium',
        token: 'demo_realtime_token_' + Date.now(),
        expiresIn: 3600,
      },
      message: 'WebSocket stream access granted',
    });
  }
);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 402pay Demo API running on port ${PORT}`);
  console.log(`   Visit http://localhost:${PORT} for API documentation`);
  console.log(`   Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
  console.log(`\n💡 Protected endpoints:`);
  console.log(`   GET /api/crypto-price (0.01 USDC)`);
  console.log(`   GET /api/market-data (0.05 USDC)`);
  console.log(`   GET /api/ai-insights (0.10 USDC)`);
});
