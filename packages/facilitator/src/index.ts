/**
 * 402pay Facilitator Backend
 * Payment verification and settlement engine
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verificationRouter } from './routes/verification';
import { subscriptionRouter } from './routes/subscriptions';
import { agentRouter } from './routes/agents';
import { analyticsRouter } from './routes/analytics';
import { demoRouter } from './routes/demo';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: '402pay-facilitator' });
});

// Public routes (no auth required)
app.use('/verify', verificationRouter);
app.use('/demo', demoRouter);

// Protected routes
app.use('/subscriptions', authMiddleware, subscriptionRouter);
app.use('/agents', authMiddleware, agentRouter);
app.use('/analytics', authMiddleware, analyticsRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 402pay Facilitator running on port ${PORT}`);
  console.log(`   Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
  console.log(`   RPC: ${process.env.SOLANA_RPC_URL || 'default'}`);
});

export { app };
