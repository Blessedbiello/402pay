/**
 * Coordinator Autonomous Agent Worker
 *
 * This meta-agent orchestrates complex tasks by:
 * 1. Breaking down complex jobs into sub-tasks
 * 2. Discovering and hiring appropriate agents for each sub-task
 * 3. Monitoring sub-job completion
 * 4. Aggregating results into final deliverable
 *
 * Demonstrates multi-agent coordination and the power of agent composition
 */

import { logger } from '../utils/logger';

const AGENT_ID = 'agent_coordinator';
const SERVICE_ID = 'service_coordinator_001';
const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const API_KEY = process.env.AGENT_API_KEY || 'demo-key';
const POLL_INTERVAL = 10000; // 10 seconds (slower poll for coordination tasks)

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

interface Service {
  id: string;
  name: string;
  category: string;
  priceAmount: number;
  capabilities: string[];
}

class CoordinatorAgent {
  private isRunning: boolean = false;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor() {
    logger.info('Coordinator Agent initialized', {
      agentId: AGENT_ID,
      serviceId: SERVICE_ID,
    });
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Coordinator Agent is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Coordinator Agent started - monitoring for orchestration tasks...');

    this.poll();
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    logger.info('Coordinator Agent stopped');
  }

  private async poll(): Promise<void> {
    try {
      const jobs = await this.fetchJobs();

      const pendingJobs = jobs.filter(
        (j) => j.status === 'pending' && j.providerAgentId === AGENT_ID
      );

      if (pendingJobs.length > 0) {
        logger.info(`Found ${pendingJobs.length} pending orchestration jobs`);
        for (const job of pendingJobs) {
          await this.processJob(job);
        }
      }

      const acceptedJobs = jobs.filter(
        (j) => j.status === 'accepted' && j.providerAgentId === AGENT_ID
      );

      if (acceptedJobs.length > 0) {
        logger.info(`Found ${acceptedJobs.length} accepted orchestration jobs`);
        for (const job of acceptedJobs) {
          await this.orchestrateJob(job);
        }
      }
    } catch (error) {
      logger.error('Error polling for orchestration jobs', { error });
    }
  }

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

  private async processJob(job: Job): Promise<void> {
    logger.info('Processing pending orchestration job', {
      jobId: job.id,
      task: job.input.parameters?.task,
    });

    try {
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

      logger.info('Successfully accepted orchestration job', { jobId: job.id });
    } catch (error) {
      logger.error('Failed to accept orchestration job', { jobId: job.id, error });
    }
  }

  /**
   * Orchestrate a complex job by hiring and coordinating multiple agents
   */
  private async orchestrateJob(job: Job): Promise<void> {
    logger.info('Orchestrating multi-agent job', {
      jobId: job.id,
      task: job.input.parameters?.task,
    });

    try {
      // Step 1: Analyze task and break down into sub-tasks
      const subTasks = this.analyzeAndPlanSubTasks(job.input);
      logger.info('Planned sub-tasks', { count: subTasks.length, subTasks });

      // Step 2: Discover appropriate services for each sub-task
      const availableServices = await this.discoverServices();
      const assignments = this.assignServicesToSubTasks(subTasks, availableServices);
      logger.info('Assigned services to sub-tasks', { assignments });

      // Step 3: Execute sub-tasks (simulate for demo)
      // In production, this would create actual sub-jobs via the marketplace API
      const subJobResults = await this.executeSubTasks(assignments);

      // Step 4: Aggregate results
      const finalResult = this.aggregateResults(subJobResults);

      // Step 5: Submit orchestrated result
      const response = await fetch(`${API_BASE}/marketplace/jobs/${job.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ output: finalResult }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit orchestrated job: ${response.status}`);
      }

      logger.info('Successfully submitted orchestrated job', { jobId: job.id });
    } catch (error) {
      logger.error('Failed to orchestrate job', { jobId: job.id, error });
    }
  }

  /**
   * Analyze task and break it down into sub-tasks
   */
  private analyzeAndPlanSubTasks(input: any): Array<{ task: string; type: string }> {
    const task = input.parameters?.task || '';
    const requirements = input.parameters?.requirements || [];

    // Simple heuristic-based task decomposition
    const subTasks = [];

    if (task.toLowerCase().includes('report') || task.toLowerCase().includes('analysis')) {
      subTasks.push({ task: 'Collect data', type: 'data-collection' });
      subTasks.push({ task: 'Analyze data', type: 'data-analysis' });
      subTasks.push({ task: 'Generate visualizations', type: 'image-generation' });
      subTasks.push({ task: 'Summarize findings', type: 'summarization' });
    } else {
      // Default decomposition based on requirements
      requirements.forEach((req: string) => {
        if (req.toLowerCase().includes('data') || req.toLowerCase().includes('scrape')) {
          subTasks.push({ task: req, type: 'data-collection' });
        } else if (req.toLowerCase().includes('analyze') || req.toLowerCase().includes('trend')) {
          subTasks.push({ task: req, type: 'data-analysis' });
        } else if (req.toLowerCase().includes('image') || req.toLowerCase().includes('chart')) {
          subTasks.push({ task: req, type: 'image-generation' });
        } else if (req.toLowerCase().includes('summarize') || req.toLowerCase().includes('report')) {
          subTasks.push({ task: req, type: 'summarization' });
        }
      });
    }

    return subTasks;
  }

  /**
   * Discover available services in the marketplace
   */
  private async discoverServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE}/marketplace/services?limit=100`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to discover services: ${response.status}`);
      }

      const data = await response.json();
      return data.services || [];
    } catch (error) {
      logger.error('Failed to discover services', { error });
      return [];
    }
  }

  /**
   * Assign appropriate services to each sub-task
   */
  private assignServicesToSubTasks(
    subTasks: Array<{ task: string; type: string }>,
    services: Service[]
  ): Array<{ subTask: any; service: Service | null }> {
    return subTasks.map((subTask) => {
      // Find best matching service based on type
      let matchedService = null;

      if (subTask.type === 'data-collection') {
        matchedService = services.find((s) => s.category === 'data');
      } else if (subTask.type === 'data-analysis') {
        matchedService = services.find((s) => s.category === 'analytics');
      } else if (subTask.type === 'image-generation') {
        matchedService = services.find(
          (s) => s.category === 'ai' && s.name.toLowerCase().includes('image')
        );
      } else if (subTask.type === 'summarization') {
        matchedService = services.find(
          (s) => s.category === 'ai' && s.name.toLowerCase().includes('summar')
        );
      }

      return {
        subTask,
        service: matchedService || null,
      };
    });
  }

  /**
   * Execute sub-tasks (simulation for demo)
   */
  private async executeSubTasks(
    assignments: Array<{ subTask: any; service: Service | null }>
  ): Promise<any[]> {
    logger.info('Executing sub-tasks in parallel...');

    // Simulate parallel execution with delays
    const results = await Promise.all(
      assignments.map(async (assignment, index) => {
        await new Promise((resolve) => setTimeout(resolve, 1000 + index * 500));

        return {
          subTaskId: `subtask_${index}`,
          task: assignment.subTask.task,
          service: assignment.service?.name || 'Unknown',
          status: 'completed',
          result: `Completed: ${assignment.subTask.task}`,
          cost: assignment.service?.priceAmount || 0,
        };
      })
    );

    return results;
  }

  /**
   * Aggregate sub-task results into final deliverable
   */
  private aggregateResults(subResults: any[]): any {
    const totalCost = subResults.reduce((sum, r) => sum + (r.cost || 0), 0);

    return {
      type: 'orchestrated-result',
      result: {
        reportUrl: `https://example.com/reports/orchestrated-${Date.now()}.pdf`,
        subJobsCompleted: subResults.length,
        subJobs: subResults.map((r) => r.subTaskId),
        totalCost,
        executionSummary: subResults.map((r) => ({
          task: r.task,
          service: r.service,
          status: r.status,
        })),
      },
      metadata: {
        processingTime: 5000,
        resourcesUsed: {
          agents_hired: subResults.length,
          parallel_executions: subResults.length,
          total_sub_job_cost: totalCost,
        },
      },
    };
  }
}

// Run the agent if executed directly
if (require.main === module) {
  const agent = new CoordinatorAgent();

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down Coordinator Agent...');
    agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down Coordinator Agent...');
    agent.stop();
    process.exit(0);
  });

  agent.start();

  logger.info('Coordinator Agent is running. Press Ctrl+C to stop.');
}

export { CoordinatorAgent };
