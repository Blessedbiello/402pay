/**
 * Agent wallet management routes
 */

import { Router } from 'express';
import { AgentWallet, REPUTATION_THRESHOLDS } from '@402pay/shared';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory storage for demo (replace with database in production)
const agents = new Map<string, AgentWallet>();

/**
 * Create an agent
 * POST /agents
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, publicKey, owner, spendingLimit, allowedServices, metadata } = req.body;

    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const agent: AgentWallet = {
      id: agentId,
      name,
      publicKey,
      owner,
      spendingLimit,
      allowedServices,
      reputation: {
        score: 0,
        transactionCount: 0,
        trustLevel: 'new',
      },
      createdAt: Date.now(),
      metadata,
    };

    agents.set(agentId, agent);

    res.status(201).json(agent);
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * Get an agent
 * GET /agents/:id
 */
router.get('/:id', (req, res) => {
  const agent = agents.get(req.params.id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json(agent);
});

/**
 * Update an agent
 * PATCH /agents/:id
 */
router.patch('/:id', (req, res) => {
  const agent = agents.get(req.params.id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const { name, spendingLimit, allowedServices, metadata } = req.body;

  if (name) agent.name = name;
  if (spendingLimit) agent.spendingLimit = spendingLimit;
  if (allowedServices) agent.allowedServices = allowedServices;
  if (metadata) agent.metadata = { ...agent.metadata, ...metadata };

  agents.set(req.params.id, agent);

  res.json(agent);
});

/**
 * Delete an agent
 * DELETE /agents/:id
 */
router.delete('/:id', (req, res) => {
  const deleted = agents.delete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.status(204).send();
});

/**
 * List all agents for the current user
 * GET /agents
 */
router.get('/', (req: AuthRequest, res) => {
  const { limit, offset, owner } = req.query;

  // In production, filter by req.userId
  let results = Array.from(agents.values());

  // Filter by owner if provided
  if (owner) {
    results = results.filter(agent => agent.owner === owner);
  }

  // Apply pagination
  const total = results.length;
  const limitNum = limit ? parseInt(limit as string) : 50;
  const offsetNum = offset ? parseInt(offset as string) : 0;

  results = results.slice(offsetNum, offsetNum + limitNum);

  res.json({
    agents: results,
    total,
  });
});

/**
 * Get agent reputation
 * GET /agents/:id/reputation
 */
router.get('/:id/reputation', (req, res) => {
  const agent = agents.get(req.params.id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json(agent.reputation || { score: 0, transactionCount: 0, trustLevel: 'new' });
});

/**
 * Update agent reputation (internal use)
 */
export function updateAgentReputation(agentId: string, successful: boolean) {
  const agent = agents.get(agentId);
  if (!agent || !agent.reputation) return;

  agent.reputation.transactionCount++;

  if (successful) {
    agent.reputation.score = Math.min(1000, agent.reputation.score + 1);
  } else {
    agent.reputation.score = Math.max(0, agent.reputation.score - 5);
  }

  // Update trust level based on score
  if (agent.reputation.score >= REPUTATION_THRESHOLDS.premium) {
    agent.reputation.trustLevel = 'premium';
  } else if (agent.reputation.score >= REPUTATION_THRESHOLDS.trusted) {
    agent.reputation.trustLevel = 'trusted';
  } else if (agent.reputation.score >= REPUTATION_THRESHOLDS.verified) {
    agent.reputation.trustLevel = 'verified';
  } else {
    agent.reputation.trustLevel = 'new';
  }

  agents.set(agentId, agent);
}

export { router as agentRouter };
