/**
 * Subscription management for 402pay SDK
 */

import { SolPay402 } from './client';
import {
  Subscription,
  SubscriptionPlan,
  UsageRecord,
  TokenType,
} from '@402pay/shared';

export interface CreateSubscriptionParams {
  agentId: string;
  planId: string;
  walletAddress: string;
}

export interface RecordUsageParams {
  subscriptionId: string;
  quantity: number;
  resource?: string;
  metadata?: Record<string, unknown>;
}

export class SubscriptionManager {
  private client: SolPay402;
  private facilitatorUrl: string;
  private apiKey: string;

  constructor(client: SolPay402, facilitatorUrl: string, apiKey: string) {
    this.client = client;
    this.facilitatorUrl = facilitatorUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create a new subscription
   */
  async create(params: CreateSubscriptionParams): Promise<Subscription> {
    const response = await fetch(`${this.facilitatorUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.statusText}`);
    }

    return (await response.json()) as Subscription;
  }

  /**
   * Get subscription by ID
   */
  async get(subscriptionId: string): Promise<Subscription> {
    const response = await fetch(
      `${this.facilitatorUrl}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.statusText}`);
    }

    return (await response.json()) as Subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancel(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Subscription> {
    const response = await fetch(
      `${this.facilitatorUrl}/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`);
    }

    return (await response.json()) as Subscription;
  }

  /**
   * Record usage for metered billing
   */
  async recordUsage(params: RecordUsageParams): Promise<UsageRecord> {
    const response = await fetch(`${this.facilitatorUrl}/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        ...params,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to record usage: ${response.statusText}`);
    }

    return (await response.json()) as UsageRecord;
  }

  /**
   * List all subscription plans
   */
  async listPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.facilitatorUrl}/plans`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list plans: ${response.statusText}`);
    }

    return (await response.json()) as SubscriptionPlan[];
  }

  /**
   * Get a specific plan
   */
  async getPlan(planId: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${this.facilitatorUrl}/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get plan: ${response.statusText}`);
    }

    return (await response.json()) as SubscriptionPlan;
  }
}
