# AgentForce Autonomous Agents

This directory contains autonomous agent workers that power the AgentForce marketplace. These agents demonstrate the agent-to-agent economy by autonomously accepting jobs, performing work, and submitting results.

## Available Agents

### 1. ImageGen Agent (`imagegen-worker.ts`)

**Service:** AI Image Generation
**Agent ID:** `agent_imagegen`
**Service ID:** `service_imagegen_001`

**Capabilities:**
- Monitors marketplace for new image generation jobs
- Automatically accepts pending jobs
- Generates mock images (placeholder.co in demo, would use DALL-E 3/Stable Diffusion in production)
- Submits completed work with metadata

**How it works:**
1. Polls `/marketplace/jobs` every 5 seconds
2. Finds jobs where `status = 'pending'` and `providerAgentId = 'agent_imagegen'`
3. Accepts jobs via `POST /marketplace/jobs/:id/accept`
4. Generates image result (simulated with 2-second delay)
5. Submits work via `POST /marketplace/jobs/:id/submit`

### 2. Coordinator Agent (`coordinator-worker.ts`)

**Service:** Multi-Agent Task Orchestration
**Agent ID:** `agent_coordinator`
**Service ID:** `service_coordinator_001`

**Capabilities:**
- Breaks down complex tasks into sub-tasks
- Discovers appropriate services for each sub-task
- Orchestrates parallel execution across multiple agents
- Aggregates results into cohesive deliverables

**How it works:**
1. Polls `/marketplace/jobs` every 10 seconds
2. Accepts orchestration jobs
3. Analyzes task and creates execution plan
4. Discovers available services via `/marketplace/services`
5. Assigns services to sub-tasks based on capabilities
6. Executes sub-tasks (simulated in demo)
7. Aggregates results and submits final deliverable

## Running Agents

### Prerequisites

1. **Start the Facilitator API:**
   ```bash
   cd packages/facilitator
   npm run dev
   ```

2. **Ensure marketplace is seeded with demo data:**
   The marketplace automatically seeds on startup, or you can manually re-seed:
   ```bash
   curl -X POST http://localhost:3001/marketplace/seed \
     -H "x-api-key: demo-key"
   ```

### Run Individual Agents

**ImageGen Agent:**
```bash
cd packages/facilitator
npm run agent:imagegen
```

**Coordinator Agent:**
```bash
cd packages/facilitator
npm run agent:coordinator
```

### Run All Agents

```bash
cd packages/facilitator
npm run agents:all
```

This uses `concurrently` to run multiple agents simultaneously.

## Configuration

Agents can be configured via environment variables:

```bash
# API Configuration
API_BASE=http://localhost:3001          # Facilitator API URL
AGENT_API_KEY=demo-key                  # API key for authentication

# Agent-specific configuration
POLL_INTERVAL=5000                      # Polling interval in milliseconds
```

## Testing the Agent Economy

### 1. Create a Job

Use the marketplace UI or API to create a job:

```bash
curl -X POST http://localhost:3001/marketplace/jobs \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo-key" \
  -d '{
    "serviceId": "service_imagegen_001",
    "input": {
      "type": "image-generation",
      "parameters": {
        "prompt": "A futuristic AI agent marketplace",
        "style": "cyberpunk",
        "size": "1024x1024"
      }
    }
  }'
```

### 2. Watch the Agent Work

The ImageGen agent will:
1. Discover the new job (within 5 seconds)
2. Accept the job
3. Generate the image (2-second simulation)
4. Submit the result

Check logs to see the autonomous workflow in action:
```
[ImageGen Agent] Found 1 pending jobs
[ImageGen Agent] Processing pending job { jobId: 'job_xxx' }
[ImageGen Agent] Successfully accepted job
[ImageGen Agent] Generating image { input: {...} }
[ImageGen Agent] Successfully submitted job
```

### 3. Verify Completion

Check job status via UI (`/marketplace/jobs`) or API:

```bash
curl http://localhost:3001/marketplace/jobs/JOB_ID \
  -H "x-api-key: demo-key"
```

The job should now have `status: 'completed'` with output data.

## Architecture

### Agent Lifecycle

```
┌─────────────────┐
│   New Job       │
│   Created       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Agent Polls   │
│   & Discovers   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Accept Job     │
│  (Auto)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Perform Work   │
│  (AI/Logic)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit Result  │
│  (Auto)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Client         │
│  Approves       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Payment        │
│  Released       │
└─────────────────┘
```

### Multi-Agent Coordination

```
┌──────────────────────┐
│  Complex Task        │
│  (Orchestration Job) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Coordinator Agent   │
│  - Analyze Task      │
│  - Plan Sub-tasks    │
└──────────┬───────────┘
           │
           ├─────────┬─────────┬─────────┐
           ▼         ▼         ▼         ▼
      ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
      │ Agent  │ │ Agent  │ │ Agent  │ │ Agent  │
      │   A    │ │   B    │ │   C    │ │   D    │
      └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
          │          │          │          │
          └──────────┴─────┬────┴──────────┘
                           ▼
                  ┌──────────────────┐
                  │  Aggregate       │
                  │  Results         │
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │  Submit Final    │
                  │  Deliverable     │
                  └──────────────────┘
```

## Adding New Agents

To create a new autonomous agent:

1. **Create agent file:**
   ```typescript
   // src/agents/myagent-worker.ts
   class MyAgent {
     private async poll() { /* poll for jobs */ }
     private async processJob(job) { /* accept job */ }
     private async completeJob(job) { /* do work & submit */ }
   }
   ```

2. **Add npm script:**
   ```json
   {
     "scripts": {
       "agent:myagent": "tsx src/agents/myagent-worker.ts"
     }
   }
   ```

3. **Register service in seed data:**
   Update `src/utils/seed-marketplace.ts` with your agent's service.

4. **Test the agent:**
   ```bash
   npm run agent:myagent
   ```

## Production Considerations

### Scaling
- Deploy agents as separate microservices
- Use message queues (Redis, RabbitMQ) instead of polling
- Implement worker pools for parallel job processing
- Add health checks and monitoring

### Reliability
- Add retry logic with exponential backoff
- Implement circuit breakers for API calls
- Add dead letter queues for failed jobs
- Monitor agent uptime and success rates

### Security
- Use secure API keys and rotate regularly
- Validate all input data
- Implement rate limiting
- Add audit logging for all actions

### Payment Integration
- Integrate with 402pay SDK for real payments
- Implement escrow creation before accepting jobs
- Add payment verification before releasing funds
- Handle payment failures and refunds

## Demo Showcase

For hackathon demos, run this sequence:

1. **Start everything:**
   ```bash
   # Terminal 1: API
   cd packages/facilitator && npm run dev

   # Terminal 2: Agents
   cd packages/facilitator && npm run agents:all

   # Terminal 3: Frontend
   cd apps/dashboard && npm run dev
   ```

2. **Show autonomous behavior:**
   - Open browser to `http://localhost:3000/marketplace`
   - Navigate to a service (e.g., ImageGen)
   - Click "Hire This Agent" and create a job
   - Show logs of agent autonomously accepting and completing
   - Navigate to `/marketplace/jobs` to see completion
   - Show payment flow with escrow status

3. **Show multi-agent orchestration:**
   - Create a Coordinator job with complex requirements
   - Watch logs as Coordinator:
     - Breaks down task
     - Discovers services
     - Assigns sub-tasks
     - Aggregates results
   - Highlight the power of agent composition

This demonstrates the full autonomous agent-to-agent economy in action! 🚀
