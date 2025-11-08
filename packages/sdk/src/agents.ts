/**
 * Agent wallet management for 402pay SDK
 */

import { SolPay402 } from './client';
import { AgentWallet } from '@402pay/shared';

export interface CreateAgentParams {
  name: string;
  publicKey: string;
  owner: string;
  spendingLimit?: {
    daily?: number;
    perTransaction?: number;
  };
  allowedServices?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentReputation {
  score: number;
  transactionCount: number;
  trustLevel: 'new' | 'verified' | 'trusted' | 'premium';
}

export class AgentManager {
  private client: SolPay402;
  private facilitatorUrl: string;
  private apiKey: string;

  constructor(client: SolPay402, facilitatorUrl: string, apiKey: string) {
    this.client = client;
    this.facilitatorUrl = facilitatorUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create a new agent wallet
   */
  async create(params: CreateAgentParams): Promise<AgentWallet> {
    const response = await fetch(`${this.facilitatorUrl}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        ...params,
        createdAt: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    return (await response.json()) as AgentWallet;
  }

  /**
   * Get agent by ID
   */
  async get(agentId: string): Promise<AgentWallet> {
    const response = await fetch(`${this.facilitatorUrl}/agents/${agentId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get agent: ${response.statusText}`);
    }

    return (await response.json()) as AgentWallet;
  }

  /**
   * Update agent configuration
   */
  async update(
    agentId: string,
    updates: Partial<CreateAgentParams>
  ): Promise<AgentWallet> {
    const response = await fetch(`${this.facilitatorUrl}/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.statusText}`);
    }

    return (await response.json()) as AgentWallet;
  }

  /**
   * Get agent reputation
   */
  async getReputation(agentId: string): Promise<AgentReputation> {
    const response = await fetch(
      `${this.facilitatorUrl}/agents/${agentId}/reputation`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get reputation: ${response.statusText}`);
    }

    return (await response.json()) as AgentReputation;
  }

  /**
   * List all agents for the current user
   */
  async list(): Promise<AgentWallet[]> {
    const response = await fetch(`${this.facilitatorUrl}/agents`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list agents: ${response.statusText}`);
    }

    return (await response.json()) as AgentWallet[];
  }

  /**
   * Delete an agent
   */
  async delete(agentId: string): Promise<void> {
    const response = await fetch(`${this.facilitatorUrl}/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.statusText}`);
    }
  }
}
