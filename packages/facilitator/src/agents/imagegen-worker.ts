/**
 * ImageGen Autonomous Agent Worker
 *
 * This agent autonomously:
 * 1. Monitors for new jobs on the ImageGen service
 * 2. Accepts pending jobs automatically
 * 3. Generates mock image results
 * 4. Submits completed work
 *
 * Demonstrates the autonomous agent-to-agent economy in action
 */

import { logger } from '../utils/logger';

const AGENT_ID = 'agent_imagegen';
const SERVICE_ID = 'service_imagegen_001';
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const API_KEY = process.env.AGENT_API_KEY || 'demo-key';
const POLL_INTERVAL = 5000; // 5 seconds

interface Job {
  id: string;
  clientAgentId: string;
  serviceId: string;
  providerAgentId: string;
  status: string;
  input: any;
  output?: any;
  paymentAmount: number;
  paymentCurrency: string;
  createdAt: number;
  deadline: number;
}

class ImageGenAgent {
  private isRunning: boolean = false;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor() {
    logger.info('ImageGen Agent initialized', {
      agentId: AGENT_ID,
      serviceId: SERVICE_ID,
    });
  }

  /**
   * Start the agent worker
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('ImageGen Agent is already running');
      return;
    }

    this.isRunning = true;
    logger.info('ImageGen Agent started - monitoring for jobs...');

    // Start polling for jobs
    this.poll();
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL);
  }

  /**
   * Stop the agent worker
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    logger.info('ImageGen Agent stopped');
  }

  /**
   * Poll for new jobs
   */
  private async poll(): Promise<void> {
    try {
      // Fetch jobs for this service
      const jobs = await this.fetchJobs();

      // Process pending jobs
      const pendingJobs = jobs.filter(
        (j) => j.status === 'pending' && j.providerAgentId === AGENT_ID
      );

      if (pendingJobs.length > 0) {
        logger.info(`Found ${pendingJobs.length} pending jobs`);
        for (const job of pendingJobs) {
          await this.processJob(job);
        }
      }

      // Process accepted jobs
      const acceptedJobs = jobs.filter(
        (j) => j.status === 'accepted' && j.providerAgentId === AGENT_ID
      );

      if (acceptedJobs.length > 0) {
        logger.info(`Found ${acceptedJobs.length} accepted jobs to complete`);
        for (const job of acceptedJobs) {
          await this.completeJob(job);
        }
      }
    } catch (error) {
      logger.error('Error polling for jobs', { error });
    }
  }

  /**
   * Fetch jobs from the marketplace API
   */
  private async fetchJobs(): Promise<Job[]> {
    try {
      const response = await fetch(`${API_BASE}/marketplace/jobs?providerAgentId=${AGENT_ID}`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      logger.error('Failed to fetch jobs', { error });
      return [];
    }
  }

  /**
   * Process a pending job (accept it)
   */
  private async processJob(job: Job): Promise<void> {
    logger.info('Processing pending job', {
      jobId: job.id,
      clientAgentId: job.clientAgentId,
      paymentAmount: job.paymentAmount,
    });

    try {
      // Accept the job
      const response = await fetch(`${API_BASE}/marketplace/jobs/${job.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to accept job: ${response.status}`);
      }

      logger.info('Successfully accepted job', { jobId: job.id });
    } catch (error) {
      logger.error('Failed to accept job', { jobId: job.id, error });
    }
  }

  /**
   * Complete an accepted job (generate and submit work)
   */
  private async completeJob(job: Job): Promise<void> {
    logger.info('Completing accepted job', { jobId: job.id });

    try {
      // Simulate work (image generation)
      const output = await this.generateImage(job.input);

      // Submit the work
      const response = await fetch(`${API_BASE}/marketplace/jobs/${job.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ output }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit job: ${response.status}`);
      }

      logger.info('Successfully submitted job', { jobId: job.id });
    } catch (error) {
      logger.error('Failed to complete job', { jobId: job.id, error });
    }
  }

  /**
   * Generate mock image result
   * In production, this would call DALL-E, Stable Diffusion, etc.
   */
  private async generateImage(input: any): Promise<any> {
    logger.info('Generating image', { input });

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const prompt = input.parameters?.prompt || 'default image';
    const style = input.parameters?.style || 'realistic';
    const size = input.parameters?.size || '1024x1024';

    // Mock image result
    return {
      type: 'image',
      result: {
        url: `https://placeholder.co/${size}/png?text=${encodeURIComponent(prompt.slice(0, 30))}`,
        format: 'png',
        dimensions: {
          width: parseInt(size.split('x')[0]),
          height: parseInt(size.split('x')[1]),
        },
        generationTime: 2000,
        style,
        prompt,
      },
      metadata: {
        processingTime: 2000,
        resourcesUsed: {
          gpu_seconds: 1.2,
          api_calls: 1,
        },
        model: 'dalle-3-simulation',
      },
    };
  }
}

// Run the agent if executed directly
if (require.main === module) {
  const agent = new ImageGenAgent();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down ImageGen Agent...');
    agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down ImageGen Agent...');
    agent.stop();
    process.exit(0);
  });

  // Start the agent
  agent.start();

  logger.info('ImageGen Agent is running. Press Ctrl+C to stop.');
}

export { ImageGenAgent };
