/**
 * Seed data for AgentForce Marketplace demo
 * Run this to populate the marketplace with demo services and jobs
 */

import { logger } from './logger';

export interface AgentService {
  id: string;
  agentId: string;
  name: string;
  description: string;
  category: 'ai' | 'data' | 'development' | 'automation' | 'analytics';
  pricingModel: 'per-request' | 'per-hour' | 'fixed';
  priceAmount: number;
  priceCurrency: 'USDC' | 'SOL';
  capabilities: string[];
  tags: string[];
  averageResponseTime: number;
  reliability: number;
  totalJobs: number;
  successfulJobs: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface JobRequest {
  id: string;
  clientAgentId: string;
  serviceId: string;
  providerAgentId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'approved' | 'disputed' | 'cancelled';
  input: Record<string, any>;
  output?: Record<string, any>;
  paymentAmount: number;
  paymentCurrency: string;
  escrowAddress?: string;
  escrowStatus: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed';
  escrowTransactionId?: string;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
  approvedAt?: number;
  deadline: number;
}

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

/**
 * Demo Agent Services
 */
export const DEMO_SERVICES: AgentService[] = [
  // 1. ImageGen Agent - AI Image Generation
  {
    id: 'service_imagegen_001',
    agentId: 'agent_imagegen',
    name: 'AI Image Generation',
    description: 'Professional image generation powered by DALL-E 3 and Stable Diffusion. Create stunning visuals, illustrations, charts, and diagrams from text descriptions. Perfect for reports, presentations, and creative projects.',
    category: 'ai',
    pricingModel: 'per-request',
    priceAmount: 0.5,
    priceCurrency: 'USDC',
    capabilities: ['dall-e-3', 'stable-diffusion', 'image-editing', 'style-transfer', 'upscaling'],
    tags: ['images', 'creative', 'dall-e', 'ai-art', 'visualization'],
    averageResponseTime: 8500, // 8.5 seconds
    reliability: 98.5,
    totalJobs: 247,
    successfulJobs: 243,
    totalEarnings: 123.5,
    isActive: true,
    createdAt: now - 45 * DAY,
    updatedAt: now - 2 * DAY,
  },

  // 2. DataAnalyst Agent - Data Analysis & Visualization
  {
    id: 'service_dataanalyst_001',
    agentId: 'agent_dataanalyst',
    name: 'Data Analysis & Insights',
    description: 'Comprehensive data analysis service with statistical modeling, trend analysis, and interactive visualizations. Supports CSV, JSON, and Excel formats. Generates professional reports with charts, insights, and actionable recommendations.',
    category: 'analytics',
    pricingModel: 'per-request',
    priceAmount: 2.0,
    priceCurrency: 'USDC',
    capabilities: ['statistical-analysis', 'data-visualization', 'trend-detection', 'forecasting', 'reporting'],
    tags: ['data', 'analytics', 'statistics', 'charts', 'insights', 'business-intelligence'],
    averageResponseTime: 12000, // 12 seconds
    reliability: 99.2,
    totalJobs: 189,
    successfulJobs: 187,
    totalEarnings: 378.0,
    isActive: true,
    createdAt: now - 38 * DAY,
    updatedAt: now - 1 * DAY,
  },

  // 3. CodeReviewer Agent - Code Quality & Security
  {
    id: 'service_codereview_001',
    agentId: 'agent_codereview',
    name: 'Code Review & Quality Check',
    description: 'Automated code review with best practices analysis, security scanning, and performance optimization suggestions. Supports JavaScript, TypeScript, Python, Rust, Go, and more. Includes ESLint, Prettier, and custom rule enforcement.',
    category: 'development',
    pricingModel: 'per-request',
    priceAmount: 1.0,
    priceCurrency: 'USDC',
    capabilities: ['static-analysis', 'security-scan', 'best-practices', 'performance-check', 'type-checking'],
    tags: ['code-review', 'security', 'quality', 'linting', 'best-practices', 'refactoring'],
    averageResponseTime: 5500, // 5.5 seconds
    reliability: 97.8,
    totalJobs: 312,
    successfulJobs: 305,
    totalEarnings: 312.0,
    isActive: true,
    createdAt: now - 52 * DAY,
    updatedAt: now - 3 * DAY,
  },

  // 4. Coordinator Agent - Task Orchestration
  {
    id: 'service_coordinator_001',
    agentId: 'agent_coordinator',
    name: 'Multi-Agent Task Coordinator',
    description: 'Meta-agent that orchestrates complex workflows by hiring and coordinating multiple specialized agents. Breaks down complex tasks, manages parallel execution, handles dependencies, and combines results into cohesive deliverables.',
    category: 'automation',
    pricingModel: 'per-request',
    priceAmount: 5.0,
    priceCurrency: 'USDC',
    capabilities: ['task-planning', 'agent-hiring', 'workflow-orchestration', 'parallel-execution', 'result-aggregation'],
    tags: ['orchestration', 'automation', 'multi-agent', 'coordination', 'workflow', 'ai-planning'],
    averageResponseTime: 45000, // 45 seconds (coordinates multiple agents)
    reliability: 95.0,
    totalJobs: 67,
    successfulJobs: 64,
    totalEarnings: 335.0,
    isActive: true,
    createdAt: now - 28 * DAY,
    updatedAt: now - 5 * DAY,
  },

  // 5. TextSummarizer Agent - Document Summarization
  {
    id: 'service_summarizer_001',
    agentId: 'agent_summarizer',
    name: 'Document Summarization',
    description: 'Advanced document summarization using GPT-4. Extracts key points, generates executive summaries, and creates structured outlines. Supports PDFs, Word docs, web articles, and plain text. Perfect for research, legal docs, and reports.',
    category: 'ai',
    pricingModel: 'per-request',
    priceAmount: 0.75,
    priceCurrency: 'USDC',
    capabilities: ['text-summarization', 'key-point-extraction', 'document-analysis', 'multi-language'],
    tags: ['summarization', 'nlp', 'documents', 'gpt-4', 'research'],
    averageResponseTime: 6200, // 6.2 seconds
    reliability: 99.5,
    totalJobs: 421,
    successfulJobs: 419,
    totalEarnings: 315.75,
    isActive: true,
    createdAt: now - 60 * DAY,
    updatedAt: now - 1 * DAY,
  },

  // 6. WebScraper Agent - Data Collection
  {
    id: 'service_scraper_001',
    agentId: 'agent_scraper',
    name: 'Web Scraping & Data Collection',
    description: 'Professional web scraping service with anti-bot detection, JavaScript rendering, and structured data extraction. Collects data from websites, APIs, and social media. Outputs clean JSON/CSV with validation.',
    category: 'data',
    pricingModel: 'per-request',
    priceAmount: 1.5,
    priceCurrency: 'USDC',
    capabilities: ['web-scraping', 'api-extraction', 'javascript-rendering', 'data-cleaning', 'captcha-solving'],
    tags: ['scraping', 'data-collection', 'automation', 'web-data', 'extraction'],
    averageResponseTime: 18000, // 18 seconds
    reliability: 94.2,
    totalJobs: 156,
    successfulJobs: 147,
    totalEarnings: 234.0,
    isActive: true,
    createdAt: now - 41 * DAY,
    updatedAt: now - 4 * DAY,
  },
];

/**
 * Demo Job Requests
 */
export const DEMO_JOBS: JobRequest[] = [
  // Job 1: Completed image generation
  {
    id: 'job_001_completed',
    clientAgentId: 'agent_coordinator',
    serviceId: 'service_imagegen_001',
    providerAgentId: 'agent_imagegen',
    status: 'approved',
    input: {
      type: 'image-generation',
      parameters: {
        prompt: 'Professional financial chart showing Q4 revenue growth, modern minimalist style',
        style: 'professional',
        size: '1024x1024',
        format: 'png',
      },
    },
    output: {
      type: 'image',
      result: {
        url: 'https://example.com/generated/chart-q4-revenue.png',
        format: 'png',
        dimensions: { width: 1024, height: 1024 },
        generationTime: 8234,
      },
      metadata: {
        processingTime: 8234,
        resourcesUsed: { gpu_seconds: 4.2, api_calls: 1 },
      },
    },
    paymentAmount: 0.5,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount1234567890',
    escrowStatus: 'released',
    escrowTransactionId: 'tx_escrow_001',
    createdAt: now - 2 * DAY,
    acceptedAt: now - 2 * DAY + 300000, // 5 min later
    completedAt: now - 2 * DAY + 320000, // ~5 min after accept
    approvedAt: now - 2 * DAY + 600000, // 10 min total
    deadline: now - 2 * DAY + DAY,
  },

  // Job 2: In progress data analysis
  {
    id: 'job_002_in_progress',
    clientAgentId: 'agent_coordinator',
    serviceId: 'service_dataanalyst_001',
    providerAgentId: 'agent_dataanalyst',
    status: 'in_progress',
    input: {
      type: 'data-analysis',
      parameters: {
        dataUrl: 'https://example.com/data/sales-2024.csv',
        analysisType: 'trend-analysis',
        visualizations: ['line-chart', 'bar-chart', 'heatmap'],
        insights: true,
      },
    },
    paymentAmount: 2.0,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount2345678901',
    escrowStatus: 'escrowed',
    escrowTransactionId: 'tx_escrow_002',
    createdAt: now - 3600000, // 1 hour ago
    acceptedAt: now - 3000000, // ~50 min ago
    deadline: now + DAY,
  },

  // Job 3: Pending code review
  {
    id: 'job_003_pending',
    clientAgentId: 'demo_client_001',
    serviceId: 'service_codereview_001',
    providerAgentId: 'agent_codereview',
    status: 'pending',
    input: {
      type: 'code-review',
      parameters: {
        repositoryUrl: 'https://github.com/example/project',
        branch: 'feature/new-api',
        files: ['src/api/routes.ts', 'src/api/handlers.ts'],
        checks: ['security', 'performance', 'best-practices', 'type-safety'],
      },
    },
    paymentAmount: 1.0,
    paymentCurrency: 'USDC',
    escrowStatus: 'pending',
    createdAt: now - 600000, // 10 min ago
    deadline: now + 2 * DAY,
  },

  // Job 4: Completed summarization
  {
    id: 'job_004_completed',
    clientAgentId: 'demo_client_002',
    serviceId: 'service_summarizer_001',
    providerAgentId: 'agent_summarizer',
    status: 'approved',
    input: {
      type: 'document-summarization',
      parameters: {
        documentUrl: 'https://example.com/docs/whitepaper.pdf',
        summaryLength: 'medium',
        keyPoints: 5,
        outputFormat: 'markdown',
      },
    },
    output: {
      type: 'summary',
      result: {
        summary: 'This whitepaper introduces a novel approach to decentralized payments...',
        keyPoints: [
          'Introduces x402 payment protocol for autonomous agents',
          'Leverages Solana for low-cost, high-speed transactions',
          'Implements escrow-based trust system',
          'Demonstrates agent-to-agent economy viability',
          'Achieves sub-second payment confirmation',
        ],
        wordCount: { original: 8500, summary: 450 },
      },
      metadata: {
        processingTime: 6180,
        resourcesUsed: { api_calls: 3, tokens_processed: 12400 },
      },
    },
    paymentAmount: 0.75,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount3456789012',
    escrowStatus: 'released',
    escrowTransactionId: 'tx_escrow_004',
    createdAt: now - 5 * DAY,
    acceptedAt: now - 5 * DAY + 180000,
    completedAt: now - 5 * DAY + 190000,
    approvedAt: now - 5 * DAY + 300000,
    deadline: now - 5 * DAY + DAY,
  },

  // Job 5: Completed web scraping
  {
    id: 'job_005_completed',
    clientAgentId: 'demo_client_003',
    serviceId: 'service_scraper_001',
    providerAgentId: 'agent_scraper',
    status: 'approved',
    input: {
      type: 'web-scraping',
      parameters: {
        urls: ['https://example.com/products', 'https://example.com/prices'],
        selectors: {
          productName: '.product-title',
          price: '.price-value',
          rating: '.rating-score',
        },
        outputFormat: 'json',
      },
    },
    output: {
      type: 'scraped-data',
      result: {
        recordsCollected: 342,
        dataUrl: 'https://example.com/results/scrape-2024-11-09.json',
        preview: [
          { productName: 'Product A', price: 49.99, rating: 4.5 },
          { productName: 'Product B', price: 79.99, rating: 4.8 },
        ],
      },
      metadata: {
        processingTime: 17800,
        resourcesUsed: { pages_scraped: 23, requests_made: 342 },
      },
    },
    paymentAmount: 1.5,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount4567890123',
    escrowStatus: 'released',
    escrowTransactionId: 'tx_escrow_005',
    createdAt: now - 7 * DAY,
    acceptedAt: now - 7 * DAY + 600000,
    completedAt: now - 7 * DAY + 620000,
    approvedAt: now - 7 * DAY + 900000,
    deadline: now - 7 * DAY + 2 * DAY,
  },

  // Job 6: Completed orchestration (meta-job)
  {
    id: 'job_006_orchestration',
    clientAgentId: 'demo_client_004',
    serviceId: 'service_coordinator_001',
    providerAgentId: 'agent_coordinator',
    status: 'approved',
    input: {
      type: 'orchestration',
      parameters: {
        task: 'Create comprehensive market analysis report with charts',
        requirements: [
          'Scrape competitor pricing data',
          'Analyze pricing trends',
          'Generate visualization charts',
          'Summarize findings',
        ],
      },
    },
    output: {
      type: 'orchestrated-result',
      result: {
        reportUrl: 'https://example.com/reports/market-analysis-2024.pdf',
        subJobsCompleted: 4,
        subJobs: ['job_scrape_001', 'job_analyze_001', 'job_image_001', 'job_summarize_001'],
        totalCost: 4.75, // Sum of sub-jobs
      },
      metadata: {
        processingTime: 42300,
        resourcesUsed: {
          agents_hired: 4,
          parallel_executions: 2,
          total_sub_job_cost: 4.75,
        },
      },
    },
    paymentAmount: 5.0,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount5678901234',
    escrowStatus: 'released',
    escrowTransactionId: 'tx_escrow_006',
    createdAt: now - 10 * DAY,
    acceptedAt: now - 10 * DAY + 300000,
    completedAt: now - 10 * DAY + 360000,
    approvedAt: now - 10 * DAY + 480000,
    deadline: now - 10 * DAY + 3 * DAY,
  },

  // Job 7: Recently completed image gen
  {
    id: 'job_007_recent',
    clientAgentId: 'demo_client_005',
    serviceId: 'service_imagegen_001',
    providerAgentId: 'agent_imagegen',
    status: 'completed',
    input: {
      type: 'image-generation',
      parameters: {
        prompt: 'Futuristic AI agent marketplace with holographic displays',
        style: 'cyberpunk',
        size: '1792x1024',
      },
    },
    output: {
      type: 'image',
      result: {
        url: 'https://example.com/generated/marketplace-concept.png',
        format: 'png',
        dimensions: { width: 1792, height: 1024 },
        generationTime: 9100,
      },
    },
    paymentAmount: 0.5,
    paymentCurrency: 'USDC',
    escrowAddress: 'EscrowAccount6789012345',
    escrowStatus: 'escrowed',
    escrowTransactionId: 'tx_escrow_007',
    createdAt: now - 1800000, // 30 min ago
    acceptedAt: now - 1500000,
    completedAt: now - 1480000,
    deadline: now + DAY,
  },
];

/**
 * Seed the marketplace with demo data
 */
export function seedMarketplace(
  services: Map<string, AgentService>,
  jobs: Map<string, JobRequest>
): void {
  logger.info('Seeding marketplace with demo data...');

  // Clear existing data
  services.clear();
  jobs.clear();

  // Add services
  DEMO_SERVICES.forEach((service) => {
    services.set(service.id, service);
    logger.info(`Added service: ${service.name} (${service.id})`);
  });

  // Add jobs
  DEMO_JOBS.forEach((job) => {
    jobs.set(job.id, job);
    logger.info(`Added job: ${job.id} (status: ${job.status})`);
  });

  logger.info(`Marketplace seeded successfully!`);
  logger.info(`- Services: ${services.size}`);
  logger.info(`- Jobs: ${jobs.size}`);
  logger.info(`- Total volume: ${calculateTotalVolume(jobs)} USDC`);
}

/**
 * Calculate total transaction volume from approved jobs
 */
function calculateTotalVolume(jobs: Map<string, JobRequest>): number {
  return Array.from(jobs.values())
    .filter((j) => j.status === 'approved')
    .reduce((sum, j) => sum + j.paymentAmount, 0);
}

/**
 * Get marketplace statistics
 */
export function getMarketplaceStats(
  services: Map<string, AgentService>,
  jobs: Map<string, JobRequest>
) {
  const allJobs = Array.from(jobs.values());
  const allServices = Array.from(services.values());

  return {
    totalServices: allServices.filter((s) => s.isActive).length,
    totalJobs: allJobs.length,
    completedJobs: allJobs.filter((j) => j.status === 'approved').length,
    totalVolume: calculateTotalVolume(jobs),
    activeAgents: new Set([
      ...allServices.map((s) => s.agentId),
      ...allJobs.map((j) => j.clientAgentId),
      ...allJobs.map((j) => j.providerAgentId),
    ]).size,
    avgServiceEarnings:
      allServices.reduce((sum, s) => sum + s.totalEarnings, 0) / allServices.length,
    avgSuccessRate:
      allServices.reduce(
        (sum, s) => sum + (s.totalJobs > 0 ? (s.successfulJobs / s.totalJobs) * 100 : 0),
        0
      ) / allServices.length,
  };
}
