/**
 * AgentForce Marketplace Routes
 * Service registry and discovery for agent-to-agent economy
 */

import { Router } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import {
  AgentService,
  JobRequest,
  seedMarketplace,
  getMarketplaceStats
} from '../utils/seed-marketplace';

const router = Router();

// In-memory storage for demo (replace with Prisma in production)
const services = new Map<string, AgentService>();
const jobs = new Map<string, JobRequest>();

// Seed marketplace with demo data on startup
seedMarketplace(services, jobs);

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
router.get('/services', (req, res) => {
  const { category, minPrice, maxPrice, sort = 'popular', limit = 20, offset = 0 } = req.query;

  let results = Array.from(services.values()).filter(s => s.isActive);

  // Filter by category
  if (category && typeof category === 'string') {
    results = results.filter(s => s.category === category);
  }

  // Filter by price range
  if (minPrice && typeof minPrice === 'string') {
    results = results.filter(s => s.priceAmount >= parseFloat(minPrice));
  }
  if (maxPrice && typeof maxPrice === 'string') {
    results = results.filter(s => s.priceAmount <= parseFloat(maxPrice));
  }

  // Sort results
  switch (sort) {
    case 'popular':
      results.sort((a, b) => b.totalJobs - a.totalJobs);
      break;
    case 'price-low':
      results.sort((a, b) => a.priceAmount - b.priceAmount);
      break;
    case 'price-high':
      results.sort((a, b) => b.priceAmount - a.priceAmount);
      break;
    case 'rating':
      results.sort((a, b) => {
        const ratingA = a.totalJobs > 0 ? (a.successfulJobs / a.totalJobs) * 100 : 0;
        const ratingB = b.totalJobs > 0 ? (b.successfulJobs / b.totalJobs) * 100 : 0;
        return ratingB - ratingA;
      });
      break;
    case 'newest':
      results.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  // Pagination
  const total = results.length;
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  results = results.slice(offsetNum, offsetNum + limitNum);

  res.json({
    services: results,
    total,
    limit: limitNum,
    offset: offsetNum,
  });
});

/**
 * Get service by ID
 * GET /marketplace/services/:id
 */
router.get('/services/:id', (req, res) => {
  const service = services.get(req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Calculate average rating
  const serviceJobs = Array.from(jobs.values()).filter(j => j.serviceId === service.id);
  const rating = service.totalJobs > 0
    ? (service.successfulJobs / service.totalJobs) * 5
    : 5;

  res.json({
    ...service,
    rating,
    recentJobs: serviceJobs.slice(-5).map(j => ({
      id: j.id,
      status: j.status,
      completedAt: j.completedAt,
    })),
  });
});

/**
 * Create a new service
 * POST /marketplace/services
 */
router.post('/services', (req: AuthRequest, res) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const agentId = req.query.agentId as string || 'default-agent';

    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const service: AgentService = {
      id: serviceId,
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    services.set(serviceId, service);

    logger.info('Service created', { serviceId, agentId, name: data.name });

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
router.patch('/services/:id', (req: AuthRequest, res) => {
  const service = services.get(req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Update allowed fields
  const allowedUpdates = ['name', 'description', 'priceAmount', 'isActive', 'tags'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      (service as any)[field] = req.body[field];
    }
  });

  service.updatedAt = Date.now();
  services.set(req.params.id, service);

  logger.info('Service updated', { serviceId: req.params.id });

  res.json(service);
});

/**
 * Delete/deactivate a service
 * DELETE /marketplace/services/:id
 */
router.delete('/services/:id', (req: AuthRequest, res) => {
  const service = services.get(req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Soft delete - just deactivate
  service.isActive = false;
  service.updatedAt = Date.now();
  services.set(req.params.id, service);

  logger.info('Service deactivated', { serviceId: req.params.id });

  res.status(204).send();
});

// ============================================================================
// Jobs API
// ============================================================================

/**
 * Create a job request
 * POST /marketplace/jobs
 */
router.post('/jobs', (req: AuthRequest, res) => {
  try {
    const data = createJobSchema.parse(req.body);
    const clientAgentId = req.query.agentId as string || 'default-client';

    const service = services.get(data.serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (!service.isActive) {
      return res.status(400).json({ error: 'Service is not active' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const deadline = data.deadline || Date.now() + 24 * 60 * 60 * 1000; // 24 hours default

    const job: JobRequest = {
      id: jobId,
      clientAgentId,
      serviceId: service.id,
      providerAgentId: service.agentId,
      status: 'pending',
      input: data.input,
      paymentAmount: service.priceAmount,
      paymentCurrency: service.priceCurrency,
      escrowStatus: 'pending',
      createdAt: Date.now(),
      deadline,
    };

    jobs.set(jobId, job);

    logger.info('Job created', { jobId, serviceId: service.id, clientAgentId });

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
router.get('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

/**
 * List jobs
 * GET /marketplace/jobs
 */
router.get('/jobs', (req, res) => {
  const { status, agentId, asProvider, limit = 20, offset = 0 } = req.query;

  let results = Array.from(jobs.values());

  // Filter by status
  if (status && typeof status === 'string') {
    results = results.filter(j => j.status === status);
  }

  // Filter by agent (either as client or provider)
  if (agentId && typeof agentId === 'string') {
    if (asProvider === 'true') {
      results = results.filter(j => j.providerAgentId === agentId);
    } else {
      results = results.filter(j => j.clientAgentId === agentId);
    }
  }

  // Sort by creation date (newest first)
  results.sort((a, b) => b.createdAt - a.createdAt);

  // Pagination
  const total = results.length;
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  results = results.slice(offsetNum, offsetNum + limitNum);

  res.json({
    jobs: results,
    total,
    limit: limitNum,
    offset: offsetNum,
  });
});

/**
 * Accept a job (provider)
 * POST /marketplace/jobs/:id/accept
 */
router.post('/jobs/:id/accept', (req: AuthRequest, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'pending') {
    return res.status(400).json({ error: 'Job is not in pending status' });
  }

  job.status = 'accepted';
  job.acceptedAt = Date.now();
  jobs.set(req.params.id, job);

  logger.info('Job accepted', { jobId: req.params.id, providerAgentId: job.providerAgentId });

  res.json(job);
});

/**
 * Submit job output (provider)
 * POST /marketplace/jobs/:id/submit
 */
router.post('/jobs/:id/submit', (req: AuthRequest, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'accepted' && job.status !== 'in_progress') {
    return res.status(400).json({ error: 'Job cannot be submitted in current status' });
  }

  if (!req.body.output) {
    return res.status(400).json({ error: 'Output is required' });
  }

  job.status = 'completed';
  job.output = req.body.output;
  job.completedAt = Date.now();
  jobs.set(req.params.id, job);

  logger.info('Job completed', { jobId: req.params.id });

  res.json(job);
});

/**
 * Approve job and release payment (client)
 * POST /marketplace/jobs/:id/approve
 */
router.post('/jobs/:id/approve', (req: AuthRequest, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job is not completed' });
  }

  job.status = 'approved';
  job.approvedAt = Date.now();
  job.escrowStatus = 'released';
  jobs.set(req.params.id, job);

  // Update service stats
  const service = services.get(job.serviceId);
  if (service) {
    service.totalJobs += 1;
    service.successfulJobs += 1;
    service.totalEarnings += job.paymentAmount;
    services.set(job.serviceId, service);
  }

  logger.info('Job approved', { jobId: req.params.id, amount: job.paymentAmount });

  res.json(job);
});

/**
 * Dispute job (client)
 * POST /marketplace/jobs/:id/dispute
 */
router.post('/jobs/:id/dispute', (req: AuthRequest, res) => {
  const job = jobs.get(req.params.id);

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

  job.status = 'disputed';
  job.escrowStatus = 'disputed';
  jobs.set(req.params.id, job);

  logger.warn('Job disputed', { jobId: req.params.id, reason });

  res.json({ ...job, disputeReason: reason });
});

// ============================================================================
// Stats & Leaderboard
// ============================================================================

/**
 * Get marketplace stats
 * GET /marketplace/stats
 */
router.get('/stats', (req, res) => {
  const allJobs = Array.from(jobs.values());
  const allServices = Array.from(services.values());

  const stats = {
    totalServices: allServices.filter(s => s.isActive).length,
    totalJobs: allJobs.length,
    completedJobs: allJobs.filter(j => j.status === 'approved').length,
    totalVolume: allJobs
      .filter(j => j.status === 'approved')
      .reduce((sum, j) => sum + j.paymentAmount, 0),
    activeAgents: new Set([
      ...allServices.map(s => s.agentId),
      ...allJobs.map(j => j.clientAgentId),
      ...allJobs.map(j => j.providerAgentId),
    ]).size,
  };

  res.json(stats);
});

/**
 * Get top earning services
 * GET /marketplace/leaderboard
 */
router.get('/leaderboard', (req, res) => {
  const { limit = 10 } = req.query;

  const topServices = Array.from(services.values())
    .filter(s => s.isActive)
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, parseInt(limit as string))
    .map(s => ({
      id: s.id,
      name: s.name,
      agentId: s.agentId,
      category: s.category,
      totalEarnings: s.totalEarnings,
      totalJobs: s.totalJobs,
      successRate: s.totalJobs > 0 ? (s.successfulJobs / s.totalJobs) * 100 : 0,
      rating: s.totalJobs > 0 ? (s.successfulJobs / s.totalJobs) * 5 : 5,
    }));

  res.json({ leaderboard: topServices });
});

/**
 * Re-seed marketplace with demo data
 * POST /marketplace/seed
 */
router.post('/seed', (req: AuthRequest, res) => {
  try {
    seedMarketplace(services, jobs);
    const stats = getMarketplaceStats(services, jobs);

    res.json({
      message: 'Marketplace re-seeded successfully',
      stats,
    });
  } catch (error) {
    logger.error('Re-seed error', { error });
    res.status(500).json({ error: 'Failed to re-seed marketplace' });
  }
});

export { router as marketplaceRouter };
