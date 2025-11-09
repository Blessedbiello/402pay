/**
 * 402pay Facilitator Backend
 * Payment verification and settlement engine
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { verificationRouter } from './routes/verification';
import { subscriptionRouter } from './routes/subscriptions';
import { agentRouter } from './routes/agents';
import { analyticsRouter } from './routes/analytics';
import { demoRouter } from './routes/demo';
import { apiKeysRouter } from './routes/api-keys';
import { marketplaceRouter } from './routes/marketplace';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import {
  publicRateLimiter,
  authenticatedRateLimiter,
  verificationRateLimiter,
} from './middleware/rate-limit';
import { logger } from './utils/logger';
import { redisClient } from './utils/redis';
import { register as metricsRegister } from './utils/metrics';

dotenv.config();

// Initialize Redis connection
redisClient.connect().catch((error) => {
  logger.error('Failed to initialize Redis', { error });
});

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add request ID to request object
  (req as any).requestId = requestId;

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '402pay-facilitator',
    version: '0.1.0',
    timestamp: Date.now(),
    environment: NODE_ENV,
  });
});

// Metrics endpoint (for Prometheus)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (error) {
    logger.error('Error generating metrics', { error });
    res.status(500).end();
  }
});

// Public routes with rate limiting
app.use('/verify', verificationRateLimiter, verificationRouter);
app.use('/demo', publicRateLimiter, demoRouter);

// Protected routes with authentication and rate limiting
app.use('/subscriptions', authMiddleware, authenticatedRateLimiter, subscriptionRouter);
app.use('/agents', authMiddleware, authenticatedRateLimiter, agentRouter);
app.use('/analytics', authMiddleware, authenticatedRateLimiter, analyticsRouter);
app.use('/api-keys', authMiddleware, authenticatedRateLimiter, apiKeysRouter);
app.use('/marketplace', authMiddleware, authenticatedRateLimiter, marketplaceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`🚀 402pay Facilitator started`, {
    port: PORT,
    network: process.env.SOLANA_NETWORK || 'devnet',
    environment: NODE_ENV,
  });
});

// Handle shutdown signals
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await redisClient.disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await redisClient.disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

export { app };
