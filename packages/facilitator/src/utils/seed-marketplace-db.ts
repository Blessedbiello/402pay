/**
 * Seed marketplace database with demo data
 * Database-backed version using Prisma
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export async function seedMarketplaceDB(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding marketplace database...');

  try {
    // Clear existing demo data (optional - comment out to preserve data)
    await prisma.$transaction([
      prisma.rating.deleteMany(),
      prisma.jobRequest.deleteMany(),
      prisma.agentService.deleteMany(),
    ]);

    logger.info('Cleared existing marketplace data');

    // Seed agent services
    const services = await Promise.all([
      // AI Services
      prisma.agentService.create({
        data: {
          agentId: 'agent_ai_001',
          name: 'GPT-4 Text Generation',
          description: 'High-quality text generation powered by GPT-4. Perfect for content creation, creative writing, and complex text tasks.',
          category: 'ai',
          pricingModel: 'per-request',
          priceAmount: 0.05,
          priceCurrency: 'USDC',
          capabilities: ['text-generation', 'creative-writing', 'summarization', 'translation'],
          tags: ['gpt4', 'text', 'ai', 'nlp'],
          averageResponseTime: 2500,
          reliability: 99.5,
          totalJobs: 1247,
          successfulJobs: 1241,
          totalEarnings: 62.35,
          isActive: true,
        },
      }),
      prisma.agentService.create({
        data: {
          agentId: 'agent_ai_002',
          name: 'Image Generation (DALL-E)',
          description: 'Create stunning images from text descriptions using state-of-the-art diffusion models.',
          category: 'ai',
          pricingModel: 'per-request',
          priceAmount: 0.10,
          priceCurrency: 'USDC',
          capabilities: ['image-generation', 'text-to-image', 'art-creation'],
          tags: ['dalle', 'image', 'art', 'generative'],
          averageResponseTime: 8500,
          reliability: 98.2,
          totalJobs: 856,
          successfulJobs: 841,
          totalEarnings: 85.60,
          isActive: true,
        },
      }),
      prisma.agentService.create({
        data: {
          agentId: 'agent_ai_003',
          name: 'Sentiment Analysis Pro',
          description: 'Advanced sentiment analysis with emotion detection and tone classification.',
          category: 'ai',
          pricingModel: 'per-request',
          priceAmount: 0.02,
          priceCurrency: 'USDC',
          capabilities: ['sentiment-analysis', 'emotion-detection', 'tone-analysis'],
          tags: ['nlp', 'sentiment', 'analysis'],
          averageResponseTime: 850,
          reliability: 99.8,
          totalJobs: 3421,
          successfulJobs: 3414,
          totalEarnings: 68.42,
          isActive: true,
        },
      }),

      // Data Services
      prisma.agentService.create({
        data: {
          agentId: 'agent_data_001',
          name: 'Web Scraping Pro',
          description: 'Extract structured data from websites with anti-bot protection. Handles dynamic content and JavaScript rendering.',
          category: 'data',
          pricingModel: 'per-request',
          priceAmount: 0.15,
          priceCurrency: 'USDC',
          capabilities: ['web-scraping', 'data-extraction', 'api-integration'],
          tags: ['scraping', 'data', 'automation'],
          averageResponseTime: 5200,
          reliability: 97.5,
          totalJobs: 542,
          successfulJobs: 529,
          totalEarnings: 81.30,
          isActive: true,
        },
      }),
      prisma.agentService.create({
        data: {
          agentId: 'agent_data_002',
          name: 'Data Cleaning & Normalization',
          description: 'Clean, normalize, and validate datasets. Remove duplicates, handle missing values, and ensure data quality.',
          category: 'data',
          pricingModel: 'per-hour',
          priceAmount: 5.00,
          priceCurrency: 'USDC',
          capabilities: ['data-cleaning', 'normalization', 'validation', 'deduplication'],
          tags: ['data', 'etl', 'quality'],
          averageResponseTime: 15000,
          reliability: 99.1,
          totalJobs: 234,
          successfulJobs: 232,
          totalEarnings: 1170.00,
          isActive: true,
        },
      }),

      // Development Services
      prisma.agentService.create({
        data: {
          agentId: 'agent_dev_001',
          name: 'Code Review Assistant',
          description: 'Automated code review with security scanning, best practices checking, and performance optimization suggestions.',
          category: 'development',
          pricingModel: 'per-request',
          priceAmount: 0.08,
          priceCurrency: 'USDC',
          capabilities: ['code-review', 'security-scan', 'performance-analysis'],
          tags: ['code', 'review', 'security', 'quality'],
          averageResponseTime: 3500,
          reliability: 98.7,
          totalJobs: 678,
          successfulJobs: 669,
          totalEarnings: 54.24,
          isActive: true,
        },
      }),
      prisma.agentService.create({
        data: {
          agentId: 'agent_dev_002',
          name: 'API Testing Suite',
          description: 'Comprehensive API testing including functional, load, and security testing. Generate detailed reports.',
          category: 'development',
          pricingModel: 'per-request',
          priceAmount: 0.20,
          priceCurrency: 'USDC',
          capabilities: ['api-testing', 'load-testing', 'security-testing'],
          tags: ['testing', 'qa', 'api'],
          averageResponseTime: 12000,
          reliability: 99.3,
          totalJobs: 445,
          successfulJobs: 442,
          totalEarnings: 89.00,
          isActive: true,
        },
      }),

      // Automation Services
      prisma.agentService.create({
        data: {
          agentId: 'agent_auto_001',
          name: 'Social Media Scheduler',
          description: 'Schedule and post content across multiple social media platforms. Supports Twitter, LinkedIn, and more.',
          category: 'automation',
          pricingModel: 'per-request',
          priceAmount: 0.03,
          priceCurrency: 'USDC',
          capabilities: ['social-media', 'scheduling', 'cross-posting'],
          tags: ['social', 'automation', 'marketing'],
          averageResponseTime: 2100,
          reliability: 98.5,
          totalJobs: 1823,
          successfulJobs: 1796,
          totalEarnings: 54.69,
          isActive: true,
        },
      }),

      // Analytics Services
      prisma.agentService.create({
        data: {
          agentId: 'agent_analytics_001',
          name: 'Business Intelligence Dashboard',
          description: 'Generate interactive dashboards with KPIs, charts, and insights from your data.',
          category: 'analytics',
          pricingModel: 'fixed',
          priceAmount: 10.00,
          priceCurrency: 'USDC',
          capabilities: ['dashboards', 'visualization', 'kpi-tracking'],
          tags: ['analytics', 'bi', 'dashboards'],
          averageResponseTime: 25000,
          reliability: 97.8,
          totalJobs: 123,
          successfulJobs: 120,
          totalEarnings: 1230.00,
          isActive: true,
        },
      }),
      prisma.agentService.create({
        data: {
          agentId: 'agent_analytics_002',
          name: 'Predictive Analytics Engine',
          description: 'Machine learning-powered forecasting and trend analysis for business metrics.',
          category: 'analytics',
          pricingModel: 'per-hour',
          priceAmount: 8.00,
          priceCurrency: 'USDC',
          capabilities: ['forecasting', 'ml', 'prediction', 'trend-analysis'],
          tags: ['ml', 'analytics', 'forecasting'],
          averageResponseTime: 18000,
          reliability: 96.5,
          totalJobs: 89,
          successfulJobs: 86,
          totalEarnings: 712.00,
          isActive: true,
        },
      }),
    ]);

    logger.info(`Created ${services.length} agent services`);

    // Seed some sample jobs
    const jobs = await Promise.all([
      // Completed jobs
      prisma.jobRequest.create({
        data: {
          clientAgentId: 'client_001',
          serviceId: services[0].id, // GPT-4 Text Generation
          providerAgentId: services[0].agentId,
          status: 'approved',
          input: { prompt: 'Write a blog post about AI agents', wordCount: 500 },
          output: { text: 'AI agents are revolutionizing...', wordCount: 523 },
          paymentAmount: 0.05,
          paymentCurrency: 'USDC',
          escrowStatus: 'released',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          acceptedAt: new Date(Date.now() - 71 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 69 * 60 * 60 * 1000),
        },
      }),
      prisma.jobRequest.create({
        data: {
          clientAgentId: 'client_002',
          serviceId: services[1].id, // Image Generation
          providerAgentId: services[1].agentId,
          status: 'approved',
          input: { prompt: 'A futuristic cityscape at sunset', style: 'realistic' },
          output: { imageUrl: 'https://example.com/image1.png', width: 1024, height: 1024 },
          paymentAmount: 0.10,
          paymentCurrency: 'USDC',
          escrowStatus: 'released',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          acceptedAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 45 * 60 * 60 * 1000),
        },
      }),

      // In-progress jobs
      prisma.jobRequest.create({
        data: {
          clientAgentId: 'client_003',
          serviceId: services[3].id, // Web Scraping
          providerAgentId: services[3].agentId,
          status: 'in_progress',
          input: { url: 'https://example.com', selectors: ['h1', '.content'] },
          paymentAmount: 0.15,
          paymentCurrency: 'USDC',
          escrowStatus: 'escrowed',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      }),

      // Pending jobs
      prisma.jobRequest.create({
        data: {
          clientAgentId: 'client_004',
          serviceId: services[6].id, // API Testing
          providerAgentId: services[6].agentId,
          status: 'pending',
          input: { apiUrl: 'https://api.example.com', endpoints: ['/users', '/products'] },
          paymentAmount: 0.20,
          paymentCurrency: 'USDC',
          escrowStatus: 'pending',
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      }),
    ]);

    logger.info(`Created ${jobs.length} sample jobs`);

    // Create some ratings for completed jobs
    await Promise.all([
      prisma.rating.create({
        data: {
          jobId: jobs[0].id,
          serviceId: services[0].id,
          score: 5,
          feedback: 'Excellent work! The blog post was well-written and exceeded expectations.',
        },
      }),
      prisma.rating.create({
        data: {
          jobId: jobs[1].id,
          serviceId: services[1].id,
          score: 4,
          feedback: 'Great image quality, but took a bit longer than expected.',
        },
      }),
    ]);

    logger.info('Created sample ratings');

    logger.info('Marketplace database seeded successfully');
  } catch (error) {
    logger.error('Error seeding marketplace database', { error });
    throw error;
  }
}
