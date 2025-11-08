/**
 * Subscription management routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { Subscription, SubscriptionPlan, UsageRecord } from '@402pay/shared';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory storage for demo (replace with database in production)
const subscriptions = new Map<string, Subscription>();
const plans = new Map<string, SubscriptionPlan>();
const usageRecords = new Map<string, UsageRecord[]>();

// Initialize some demo plans
plans.set('basic', {
  id: 'basic',
  name: 'Basic Plan',
  description: 'For individuals and small agents',
  pricePerMonth: 5.0,
  currency: 'USDC',
  features: ['1000 API calls/month', 'Basic analytics', 'Email support'],
  limits: {
    requestsPerMonth: 1000,
  },
});

plans.set('pro', {
  id: 'pro',
  name: 'Pro Plan',
  description: 'For professional agents and small teams',
  pricePerMonth: 20.0,
  currency: 'USDC',
  features: [
    '10,000 API calls/month',
    'Advanced analytics',
    'Priority support',
    'Custom integrations',
  ],
  limits: {
    requestsPerMonth: 10000,
  },
});

/**
 * List all plans
 * GET /subscriptions/plans
 */
router.get('/plans', (req, res) => {
  res.json(Array.from(plans.values()));
});

/**
 * Get a specific plan
 * GET /subscriptions/plans/:planId
 */
router.get('/plans/:planId', (req, res) => {
  const plan = plans.get(req.params.planId);

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  res.json(plan);
});

/**
 * Create a subscription
 * POST /subscriptions
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { agentId, planId, walletAddress } = req.body;

    const plan = plans.get(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const now = Date.now();
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const subscription: Subscription = {
      id: subscriptionId,
      planId,
      agentId,
      walletAddress,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    subscriptions.set(subscriptionId, subscription);

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * List all subscriptions
 * GET /subscriptions
 */
router.get('/', (req, res) => {
  const { status, agentId, limit, offset } = req.query;

  let results = Array.from(subscriptions.values());

  // Filter by status if provided
  if (status) {
    results = results.filter(sub => sub.status === status);
  }

  // Filter by agentId if provided
  if (agentId) {
    results = results.filter(sub => sub.agentId === agentId);
  }

  // Apply pagination
  const total = results.length;
  const limitNum = limit ? parseInt(limit as string) : 50;
  const offsetNum = offset ? parseInt(offset as string) : 0;

  results = results.slice(offsetNum, offsetNum + limitNum);

  res.json({
    subscriptions: results,
    total,
    limit: limitNum,
    offset: offsetNum,
  });
});

/**
 * Get a subscription
 * GET /subscriptions/:id
 */
router.get('/:id', (req, res) => {
  const subscription = subscriptions.get(req.params.id);

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  res.json(subscription);
});

/**
 * Cancel a subscription
 * POST /subscriptions/:id/cancel
 */
router.post('/:id/cancel', (req, res) => {
  const subscription = subscriptions.get(req.params.id);

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  const { cancelAtPeriodEnd = true } = req.body;

  subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
  if (!cancelAtPeriodEnd) {
    subscription.status = 'cancelled';
  }
  subscription.updatedAt = Date.now();

  subscriptions.set(req.params.id, subscription);

  res.json(subscription);
});

/**
 * Record usage
 * POST /subscriptions/usage
 */
router.post('/usage', async (req: AuthRequest, res) => {
  try {
    const { subscriptionId, quantity, resource, metadata } = req.body;

    const subscription = subscriptions.get(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const usageId = `usage_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const usage: UsageRecord = {
      id: usageId,
      subscriptionId,
      quantity,
      timestamp: Date.now(),
      resource,
      metadata,
    };

    if (!usageRecords.has(subscriptionId)) {
      usageRecords.set(subscriptionId, []);
    }

    usageRecords.get(subscriptionId)!.push(usage);

    res.status(201).json(usage);
  } catch (error) {
    console.error('Record usage error:', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
});

/**
 * Get usage for a subscription
 * GET /subscriptions/:id/usage
 */
router.get('/:id/usage', (req, res) => {
  const subscription = subscriptions.get(req.params.id);

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  const usage = usageRecords.get(req.params.id) || [];

  res.json(usage);
});

export { router as subscriptionRouter };
