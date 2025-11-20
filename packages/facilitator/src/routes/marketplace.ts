/**
 * AgentForce Marketplace Routes
 * Service registry and discovery for agent-to-agent economy
 *
 * MIGRATED TO PRISMA - Replaced in-memory Maps with database persistence
 */

import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(['ai', 'data', 'development', 'automation', 'analytics']),
  pricingModel: z.enum(['per-request', 'per-hour', 'fixed']),
  priceAmount: z.number().positive(),
  priceCurrency: z.enum(['USDC', 'SOL']).default('USDC'),
  capabilities: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const createJobSchema = z.object({
  serviceId: z.string(),
  input: z.record(z.any()),
  deadline: z.number().optional(),
});

// ============================================================================
// Services API
// ============================================================================

/**
 * List all active services
 * GET /marketplace/services
 */
router.get('/services', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort = 'popular', limit = 20, offset = 0 } = req.query;

    // Build query filters
    const where: Prisma.AgentServiceWhereInput = { isActive: true };

    if (category && typeof category === 'string') {
      where.category = category as any;
    }

    if (minPrice || maxPrice) {
      where.priceAmount = {};
      if (minPrice && typeof minPrice === 'string') {
        where.priceAmount.gte = parseFloat(minPrice);
      }
      if (maxPrice && typeof maxPrice === 'string') {
        where.priceAmount.lte = parseFloat(maxPrice);
      }
    }

    // Build sort order
    let orderBy: Prisma.AgentServiceOrderByWithRelationInput = {};
    switch (sort) {
      case 'popular':
        orderBy = { totalJobs: 'desc' };
        break;
      case 'price-low':
        orderBy = { priceAmount: 'asc' };
        break;
      case 'price-high':
        orderBy = { priceAmount: 'desc' };
        break;
      case 'rating':
        // For rating, we'll fetch all and sort in memory (can be optimized with computed column)
        orderBy = { successfulJobs: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const [services, total] = await Promise.all([
      prisma.agentService.findMany({
        where,
        orderBy,
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.agentService.count({ where }),
    ]);

    res.json({
      services,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    logger.error('List services error', { error });
    res.status(500).json({ error: 'Failed to list services' });
  }
});

/**
 * Get service by ID
 * GET /marketplace/services/:id
 */
router.get('/services/:id', async (req, res) => {
  try {
    const service = await prisma.agentService.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            completedAt: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate average rating
    const rating = service.totalJobs > 0
      ? (service.successfulJobs / service.totalJobs) * 5
      : 5;

    res.json({
      ...service,
      rating,
      recentJobs: service.jobs,
    });
  } catch (error) {
    logger.error('Get service error', { error });
    res.status(500).json({ error: 'Failed to get service' });
  }
});

/**
 * Create a new service
 * POST /marketplace/services
 */
router.post('/services', async (req: AuthRequest, res) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const agentId = req.query.agentId as string || 'default-agent';

    const service = await prisma.agentService.create({
      data: {
        agentId,
        name: data.name,
        description: data.description,
        category: data.category,
        pricingModel: data.pricingModel,
        priceAmount: data.priceAmount,
        priceCurrency: data.priceCurrency,
        capabilities: data.capabilities,
        tags: data.tags,
        averageResponseTime: 0,
        reliability: 100,
        totalJobs: 0,
        successfulJobs: 0,
        totalEarnings: 0,
        isActive: true,
      },
    });

    logger.info('Service created', { serviceId: service.id, agentId, name: data.name });

    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Create service error', { error });
    res.status(500).json({ error: 'Failed to create service' });
  }
});

/**
 * Update a service
 * PATCH /marketplace/services/:id
 */
router.patch('/services/:id', async (req: AuthRequest, res) => {
  try {
    const service = await prisma.agentService.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Build update data with only allowed fields
    const updateData: Prisma.AgentServiceUpdateInput = {};
    const allowedUpdates = ['name', 'description', 'priceAmount', 'isActive', 'tags'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field as keyof Prisma.AgentServiceUpdateInput] = req.body[field];
      }
    });

    const updated = await prisma.agentService.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Service updated', { serviceId: req.params.id });

    res.json(updated);
  } catch (error) {
    logger.error('Update service error', { error });
    res.status(500).json({ error: 'Failed to update service' });
  }
});

/**
 * Delete/deactivate a service
 * DELETE /marketplace/services/:id
 */
router.delete('/services/:id', async (req: AuthRequest, res) => {
  try {
    const service = await prisma.agentService.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Soft delete - just deactivate
    await prisma.agentService.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    logger.info('Service deactivated', { serviceId: req.params.id });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete service error', { error });
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ============================================================================
// Jobs API
// ============================================================================

/**
 * Create a job request
 * POST /marketplace/jobs
 */
router.post('/jobs', async (req: AuthRequest, res) => {
  try {
    const data = createJobSchema.parse(req.body);
    const clientAgentId = req.query.agentId as string || 'default-client';

    const service = await prisma.agentService.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (!service.isActive) {
      return res.status(400).json({ error: 'Service is not active' });
    }

    const deadline = data.deadline
      ? new Date(data.deadline)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

    const job = await prisma.jobRequest.create({
      data: {
        clientAgentId,
        serviceId: service.id,
        providerAgentId: service.agentId,
        status: 'pending',
        input: data.input as Prisma.InputJsonValue,
        paymentAmount: service.priceAmount,
        paymentCurrency: service.priceCurrency,
        escrowStatus: req.body.escrowAddress ? 'escrowed' : 'pending',
        escrowAddress: req.body.escrowAddress,
        escrowTransactionId: req.body.escrowTransactionId,
        deadline,
      },
    });

    logger.info('Job created', {
      jobId: job.id,
      serviceId: service.id,
      clientAgentId,
      hasEscrow: !!req.body.escrowAddress,
    });

    res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Create job error', { error });
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * Get job by ID
 * GET /marketplace/jobs/:id
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: req.params.id },
      include: {
        service: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    logger.error('Get job error', { error });
    res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * List jobs
 * GET /marketplace/jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const { status, agentId, asProvider, limit = 20, offset = 0 } = req.query;

    const where: Prisma.JobRequestWhereInput = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (agentId && typeof agentId === 'string') {
      if (asProvider === 'true') {
        where.providerAgentId = agentId;
      } else {
        where.clientAgentId = agentId;
      }
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const [jobs, total] = await Promise.all([
      prisma.jobRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.jobRequest.count({ where }),
    ]);

    res.json({
      jobs,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    logger.error('List jobs error', { error });
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

/**
 * Accept a job (provider)
 * POST /marketplace/jobs/:id/accept
 */
router.post('/jobs/:id/accept', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({ error: 'Job is not in pending status' });
    }

    const updated = await prisma.jobRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    logger.info('Job accepted', { jobId: req.params.id, providerAgentId: job.providerAgentId });

    res.json(updated);
  } catch (error) {
    logger.error('Accept job error', { error });
    res.status(500).json({ error: 'Failed to accept job' });
  }
});

/**
 * Submit job output (provider)
 * POST /marketplace/jobs/:id/submit
 */
router.post('/jobs/:id/submit', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'accepted' && job.status !== 'in_progress') {
      return res.status(400).json({ error: 'Job cannot be submitted in current status' });
    }

    if (!req.body.output) {
      return res.status(400).json({ error: 'Output is required' });
    }

    const updated = await prisma.jobRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        output: req.body.output as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    logger.info('Job completed', { jobId: req.params.id });

    res.json(updated);
  } catch (error) {
    logger.error('Submit job error', { error });
    res.status(500).json({ error: 'Failed to submit job' });
  }
});

/**
 * Approve job and release payment (client)
 * POST /marketplace/jobs/:id/approve
 */
router.post('/jobs/:id/approve', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Job is not completed' });
    }

    // Release escrow funds if escrow exists
    let releaseSignature: string | undefined;
    if (job.escrowAddress && job.escrowStatus === 'escrowed') {
      try {
        const escrowResponse = await fetch(`http://localhost:3001/escrow/job/${job.id}`, {
          headers: {
            'x-api-key': req.headers['x-api-key'] as string || 'demo-key',
          },
        });

        if (escrowResponse.ok) {
          const escrow = await escrowResponse.json();

          const releaseResponse = await fetch(`http://localhost:3001/escrow/${escrow.id}/release`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': req.headers['x-api-key'] as string || 'demo-key',
            },
            body: JSON.stringify({
              recipient: job.providerAgentId,
            }),
          });

          if (releaseResponse.ok) {
            const releaseResult = await releaseResponse.json();
            releaseSignature = releaseResult.signature;
            logger.info('Escrow released', {
              jobId: job.id,
              escrowId: escrow.id,
              signature: releaseSignature,
            });
          }
        }
      } catch (error) {
        logger.error('Error releasing escrow', { error, jobId: job.id });
      }
    }

    // Use transaction to update both job and service atomically
    const [updatedJob, updatedService] = await prisma.$transaction([
      prisma.jobRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          escrowStatus: 'released',
          escrowTransactionId: releaseSignature || job.escrowTransactionId,
        },
      }),
      prisma.agentService.update({
        where: { id: job.serviceId },
        data: {
          totalJobs: { increment: 1 },
          successfulJobs: { increment: 1 },
          totalEarnings: { increment: job.paymentAmount },
        },
      }),
    ]);

    logger.info('Job approved', {
      jobId: req.params.id,
      amount: job.paymentAmount,
      releaseSignature,
    });

    res.json(updatedJob);
  } catch (error) {
    logger.error('Approve job error', { error });
    res.status(500).json({ error: 'Failed to approve job' });
  }
});

/**
 * Dispute job (client)
 * POST /marketplace/jobs/:id/dispute
 */
router.post('/jobs/:id/dispute', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.jobRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Can only dispute completed jobs' });
    }

    const reason = req.body.reason;
    if (!reason) {
      return res.status(400).json({ error: 'Dispute reason is required' });
    }

    const updated = await prisma.jobRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'disputed',
        escrowStatus: 'disputed',
        metadata: { disputeReason: reason },
      },
    });

    logger.warn('Job disputed', { jobId: req.params.id, reason });

    res.json({ ...updated, disputeReason: reason });
  } catch (error) {
    logger.error('Dispute job error', { error });
    res.status(500).json({ error: 'Failed to dispute job' });
  }
});

// ============================================================================
// Stats & Leaderboard
// ============================================================================

/**
 * Get marketplace stats
 * GET /marketplace/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalServices,
      totalJobs,
      completedJobs,
      volumeData,
      uniqueAgents,
    ] = await Promise.all([
      prisma.agentService.count({ where: { isActive: true } }),
      prisma.jobRequest.count(),
      prisma.jobRequest.count({ where: { status: 'approved' } }),
      prisma.jobRequest.aggregate({
        where: { status: 'approved' },
        _sum: { paymentAmount: true },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT agent_id) as count FROM (
          SELECT agent_id FROM agent_services
          UNION
          SELECT client_agent_id as agent_id FROM job_requests
          UNION
          SELECT provider_agent_id as agent_id FROM job_requests
        ) AS all_agents
      `,
    ]);

    const stats = {
      totalServices,
      totalJobs,
      completedJobs,
      totalVolume: volumeData._sum.paymentAmount || 0,
      activeAgents: Number(uniqueAgents[0]?.count || 0),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Get stats error', { error });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Get top earning services
 * GET /marketplace/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topServices = await prisma.agentService.findMany({
      where: { isActive: true },
      orderBy: { totalEarnings: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        name: true,
        agentId: true,
        category: true,
        totalEarnings: true,
        totalJobs: true,
        successfulJobs: true,
      },
    });

    const leaderboard = topServices.map(s => ({
      ...s,
      successRate: s.totalJobs > 0 ? (s.successfulJobs / s.totalJobs) * 100 : 0,
      rating: s.totalJobs > 0 ? (s.successfulJobs / s.totalJobs) * 5 : 5,
    }));

    res.json({ leaderboard });
  } catch (error) {
    logger.error('Get leaderboard error', { error });
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * Seed marketplace with demo data
 * POST /marketplace/seed
 */
router.post('/seed', async (req: AuthRequest, res) => {
  try {
    // Import seed data
    const { seedMarketplaceDB } = await import('../utils/seed-marketplace-db');

    await seedMarketplaceDB(prisma);

    const stats = await prisma.$transaction([
      prisma.agentService.count({ where: { isActive: true } }),
      prisma.jobRequest.count(),
    ]);

    res.json({
      message: 'Marketplace seeded successfully',
      stats: {
        services: stats[0],
        jobs: stats[1],
      },
    });
  } catch (error) {
    logger.error('Seed marketplace error', { error });
    res.status(500).json({ error: 'Failed to seed marketplace' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
});

export { router as marketplaceRouter };
