/**
 * Analytics routes
 */

import { Router } from 'express';
import { Transaction, AnalyticsEvent } from '@402pay/shared';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory storage for demo (replace with database in production)
const transactions = new Map<string, Transaction>();
const events: AnalyticsEvent[] = [];

/**
 * Get transaction history
 * GET /analytics/transactions
 */
router.get('/transactions', (req: AuthRequest, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const allTransactions = Array.from(transactions.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    transactions: allTransactions,
    total: transactions.size,
    limit: Number(limit),
    offset: Number(offset),
  });
});

/**
 * Get revenue analytics
 * GET /analytics/revenue
 */
router.get('/revenue', (req: AuthRequest, res) => {
  const { period = 'day' } = req.query;

  const now = Date.now();
  let startTime: number;

  switch (period) {
    case 'hour':
      startTime = now - 60 * 60 * 1000;
      break;
    case 'day':
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case 'week':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = 0;
  }

  const filteredTx = Array.from(transactions.values()).filter(
    (tx) => tx.timestamp >= startTime && tx.status === 'confirmed'
  );

  const revenue = filteredTx.reduce((sum, tx) => sum + tx.amount, 0);
  const count = filteredTx.length;

  // Group by currency
  const byCurrency = filteredTx.reduce(
    (acc, tx) => {
      acc[tx.currency] = (acc[tx.currency] || 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  res.json({
    period,
    revenue,
    transactionCount: count,
    byCurrency,
    startTime,
    endTime: now,
  });
});

/**
 * Get top agents by transaction volume
 * GET /analytics/top-agents
 */
router.get('/top-agents', (req: AuthRequest, res) => {
  const { limit = 10 } = req.query;

  const agentStats = Array.from(transactions.values())
    .filter((tx) => tx.agentId && tx.status === 'confirmed')
    .reduce(
      (acc, tx) => {
        const agentId = tx.agentId!;
        if (!acc[agentId]) {
          acc[agentId] = { agentId, totalAmount: 0, transactionCount: 0 };
        }
        acc[agentId].totalAmount += tx.amount;
        acc[agentId].transactionCount++;
        return acc;
      },
      {} as Record<string, { agentId: string; totalAmount: number; transactionCount: number }>
    );

  const topAgents = Object.values(agentStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, Number(limit));

  res.json(topAgents);
});

/**
 * Get analytics events
 * GET /analytics/events
 */
router.get('/events', (req: AuthRequest, res) => {
  const { type, limit = 100 } = req.query;

  let filteredEvents = events;

  if (type) {
    filteredEvents = events.filter((e) => e.type === type);
  }

  const result = filteredEvents
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, Number(limit));

  res.json(result);
});

/**
 * Record a transaction (internal use)
 */
export function recordTransaction(transaction: Transaction) {
  transactions.set(transaction.id, transaction);

  const event: AnalyticsEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'payment',
    timestamp: transaction.timestamp,
    agentId: transaction.agentId,
    resource: transaction.resource,
    amount: transaction.amount,
    currency: transaction.currency,
  };

  events.push(event);

  // Keep only last 10000 events
  if (events.length > 10000) {
    events.shift();
  }
}

export { router as analyticsRouter };
