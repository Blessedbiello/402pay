/**
 * Prometheus metrics for monitoring and observability
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry
export const register = new Registry();

// Enable default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics

/**
 * HTTP request metrics
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Payment verification metrics
 */
export const paymentVerificationTotal = new Counter({
  name: 'payment_verification_total',
  help: 'Total number of payment verifications',
  labelNames: ['status', 'currency'], // status: success, failure, expired, replay
  registers: [register],
});

export const paymentVerificationDuration = new Histogram({
  name: 'payment_verification_duration_seconds',
  help: 'Duration of payment verification in seconds',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const paymentAmountTotal = new Counter({
  name: 'payment_amount_total',
  help: 'Total payment amount processed',
  labelNames: ['currency'],
  registers: [register],
});

/**
 * Blockchain interaction metrics
 */
export const blockchainRequestTotal = new Counter({
  name: 'blockchain_request_total',
  help: 'Total number of blockchain RPC requests',
  labelNames: ['network', 'method', 'status'],
  registers: [register],
});

export const blockchainRequestDuration = new Histogram({
  name: 'blockchain_request_duration_seconds',
  help: 'Duration of blockchain RPC requests',
  labelNames: ['network', 'method'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * Redis metrics
 */
export const redisCacheHits = new Counter({
  name: 'redis_cache_hits_total',
  help: 'Total number of Redis cache hits',
  labelNames: ['operation'],
  registers: [register],
});

export const redisCacheMisses = new Counter({
  name: 'redis_cache_misses_total',
  help: 'Total number of Redis cache misses',
  labelNames: ['operation'],
  registers: [register],
});

export const redisOperationDuration = new Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

/**
 * Database metrics
 */
export const databaseQueryTotal = new Counter({
  name: 'database_query_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

/**
 * Agent metrics
 */
export const agentRequestsTotal = new Counter({
  name: 'agent_requests_total',
  help: 'Total number of requests by agents',
  labelNames: ['agent_id', 'resource'],
  registers: [register],
});

export const agentSpendingTotal = new Counter({
  name: 'agent_spending_total',
  help: 'Total spending by agents',
  labelNames: ['agent_id', 'currency'],
  registers: [register],
});

/**
 * System metrics
 */
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'],
  registers: [register],
});

/**
 * Rate limiting metrics
 */
export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit violations',
  labelNames: ['endpoint'],
  registers: [register],
});

/**
 * Helper function to record HTTP request
 */
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
) {
  httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds);
  httpRequestTotal.inc({ method, route, status_code: statusCode });
}

/**
 * Helper function to record payment verification
 */
export function recordPaymentVerification(
  status: 'success' | 'failure' | 'expired' | 'replay',
  currency: string,
  amount?: number,
  durationSeconds?: number
) {
  paymentVerificationTotal.inc({ status, currency });

  if (durationSeconds !== undefined) {
    paymentVerificationDuration.observe(durationSeconds);
  }

  if (amount !== undefined && status === 'success') {
    paymentAmountTotal.inc({ currency }, amount);
  }
}

/**
 * Helper function to record blockchain request
 */
export function recordBlockchainRequest(
  network: string,
  method: string,
  status: 'success' | 'failure',
  durationSeconds: number
) {
  blockchainRequestTotal.inc({ network, method, status });
  blockchainRequestDuration.observe({ network, method }, durationSeconds);
}

/**
 * Helper function to record error
 */
export function recordError(type: string, code: string) {
  errorTotal.inc({ type, code });
}
