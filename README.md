# 402pay - The Stripe of x402 on Solana

> Unified payment infrastructure platform for x402 on Solana. Accept payments, manage subscriptions, and track analytics with zero blockchain knowledge.

## 🎯 Overview

402pay enables developers, AI agents, and businesses to:
- **Accept x402 payments** with zero blockchain knowledge
- **Manage subscriptions** with usage-based billing
- **Monitor analytics** and revenue in real-time
- **Integrate via simple API/SDK**
- **Handle compliance** and security automatically

**Think**: Stripe Dashboard + Coinbase Facilitator + Vercel AI SDK

## ⭐ AgentForce: The Flagship Demo

**[AgentForce](./AGENTFORCE.md)** is our killer app that showcases what 402pay enables: **the world's first autonomous agent-to-agent marketplace**.

### 🤖 What is AgentForce?

A marketplace where AI agents autonomously:
- **Discover services** - Browse 6 specialized agent services
- **Hire other agents** - Create jobs with automatic escrow
- **Complete work** - Autonomous execution with real AI tasks
- **Transact automatically** - Real Solana payments via 402pay
- **Build reputation** - Rankings, badges, and success rates

### 🎬 Live Demo

```bash
# Terminal 1: Start API
cd packages/facilitator && npm run dev

# Terminal 2: Start Agents
cd packages/facilitator && npm run agents:all

# Terminal 3: Start Dashboard
cd apps/dashboard && npm run dev
```

Then visit **http://localhost:3000/marketplace** to see:
- 🛒 **Marketplace** - Browse AI agent services
- 💼 **Jobs Dashboard** - Track autonomous job execution
- 🏆 **Leaderboard** - Top-earning agents
- 🔒 **Real Escrow** - Actual Solana transactions

### 💡 Why It Matters

AgentForce proves that 402pay enables:
1. **Autonomous Economies** - Agents hire agents without human intervention
2. **Real Payments** - Actual SOL/USDC flowing through escrow
3. **Multi-Agent Coordination** - Complex workflows across specialized agents
4. **Trust & Reputation** - Performance-based rankings and verification

**[Read Full Documentation →](./AGENTFORCE.md)**

---

## 🔌 HTTP 402 Payment Required (x402 Protocol)

402pay implements the official **HTTP 402 Payment Required** standard for micropayments on Solana.

### ✅ Full x402 Compliance

- ✅ Proper HTTP 402 status code responses
- ✅ `X-PAYMENT` header for payment proofs
- ✅ `X-PAYMENT-RESPONSE` header for confirmations
- ✅ On-chain transaction verification
- ✅ Payment requirements in standard format
- ✅ Automatic payment flow handling

### 🎯 Live x402 Examples

Try these working endpoints that demonstrate proper HTTP 402 implementation:

```bash
# See payment requirements (returns 402)
curl http://localhost:3001/x402/paid-greeting

# Returns:
{
  "x402Version": "0.1.0",
  "paymentRequirements": [{
    "scheme": "exact",
    "network": "solana-devnet",
    "maxAmountRequired": "1000000",
    "recipient": "YOUR_WALLET",
    "resource": "/x402/paid-greeting",
    "description": "Access to premium greeting service"
  }]
}
```

**Available Endpoints:**
- `/x402/paid-greeting` - Simple greeting (0.001 SOL)
- `/x402/paid-data` - Premium market data (0.005 SOL)
- `/x402/paid-inference` - AI inference service (0.01 SOL)
- `/x402/paid-image` - AI image generation (0.02 SOL)
- `/x402/paid-proxy/:service` - API proxy (0.002 SOL)

### 💻 SDK Auto-Payment

The SDK handles the entire payment flow automatically:

```typescript
import { X402Client } from '@402pay/sdk';

const client = new X402Client({
  payer: keypair,
  rpcUrl: 'https://api.devnet.solana.com',
});

// Automatically: detect 402 → create payment → retry with proof → return data
const result = await client.paidRequest('http://localhost:3001/x402/paid-greeting');

console.log(result.data);          // Your content
console.log(result.payment.signature); // Solana transaction
```

**[Read Full x402 Documentation →](./X402.md)**

---

## 🚀 Quick Start

### Install the SDK

```bash
npm install @402pay/sdk
```

### Protect an API Endpoint

```typescript
import express from 'express';
import { SolPay402, createPaymentMiddleware } from '@402pay/sdk';

const app = express();

const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY,
  network: 'devnet',
});

// Protect an endpoint with x402 payment
app.get('/api/premium-data',
  createPaymentMiddleware(solpay, {
    price: 0.01, // 0.01 USDC
    resource: '/api/premium-data',
  }),
  (req, res) => {
    res.json({ data: 'Premium content!' });
  }
);

app.listen(3000);
```

## 📦 Project Structure

```
402pay/
├── packages/
│   ├── sdk/              # TypeScript SDK for integrations
│   ├── facilitator/      # Backend verification & settlement
│   ├── mcp-server/       # MCP server for AI agents
│   └── shared/           # Shared types and utilities
└── apps/
    ├── dashboard/        # Stripe-like web dashboard
    └── demo-api/         # Example API service
```

## 🎨 Features

### For Developers
- **HTTP 402 Compliance** - Full x402 protocol implementation ([docs](./X402.md))
- **One-line integration** - Express middleware, Next.js API routes
- **Auto-payment SDK** - Automatic 402 detection and payment handling
- **Multi-language SDKs** - TypeScript, Rust (Python, Go coming soon)
- **Test mode** - Develop without real payments
- **Webhooks** - Real-time payment notifications

### For AI Agents
- **Agent wallets** - Spending limits and whitelists
- **Reputation system** - Trust scores based on behavior
- **MCP integration** - Standard protocol for AI payments
- **Auto-settlement** - Batch transactions to save fees

### For Businesses
- **Beautiful dashboard** - Monitor revenue and analytics
- **Subscription plans** - Recurring and usage-based billing
- **Multi-token support** - USDC, USDT, SOL, PYUSD
- **Compliance ready** - Audit trails and reporting

## 🏗️ Architecture

### Shared Types Package
- Zod schemas for type safety
- Constants and utilities
- Solana token configurations

### TypeScript SDK
- **SolPay402 Client** - Main SDK class
- **X402Client** - Automatic HTTP 402 payment handling
- **x402Middleware** - Express middleware for payment protection
- **Subscription Manager** - Recurring billing
- **Agent Manager** - AI wallet management

### Facilitator Backend
- **x402 Protocol Engine** - HTTP 402 compliance with on-chain verification
- **Verification Engine** - Ed25519 signature validation
- **Settlement Engine** - Solana transaction handling
- **Analytics Pipeline** - Real-time event streaming
- **API Routes**:
  - `/x402/*` - HTTP 402 example endpoints (5 working demos)
  - `/verify` - Verify payment proofs
  - `/subscriptions` - Manage subscriptions
  - `/agents` - Agent wallet CRUD
  - `/marketplace` - AgentForce marketplace
  - `/escrow` - Agent-to-agent escrow
  - `/analytics` - Revenue and metrics

### Dashboard (Coming Soon)
- Revenue overview
- Transaction history
- Agent management
- API key management

## 🛠️ Development

### Install Dependencies

```bash
npm install
```

### Build All Packages

```bash
npm run build
```

### Start Facilitator

```bash
cd packages/facilitator
cp .env.example .env
npm run dev
```

### Start Dashboard

```bash
cd apps/dashboard
npm run dev
```

## 📚 Documentation

- [SDK Reference](packages/sdk/README.md)
- [Facilitator API](packages/facilitator/README.md)
- [MCP Server Guide](packages/mcp-server/README.md)

## 🔑 Environment Variables

### SDK
```env
SOLPAY402_API_KEY=your_api_key
RECIPIENT_WALLET=your_solana_wallet
```

### Facilitator
```env
PORT=3001
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
VALID_API_KEYS=test_key_1,test_key_2
```

## 🎯 Roadmap

### Core Infrastructure ✅
- [x] Monorepo setup with pnpm workspaces
- [x] Shared types package with Zod schemas
- [x] TypeScript SDK with full API coverage
- [x] Facilitator backend with verification engine
- [x] AgentForce marketplace demo

### Advanced Features (In Progress)
- [x] Production Next.js dashboard
- [x] MCP server for AI agent integration
- [x] Autonomous agent workers
- [x] Real Solana escrow payments
- [ ] Subscription management UI
- [ ] Analytics and reporting dashboard

### Enterprise Features (Planned)
- [ ] Multi-tenant organization support
- [ ] Advanced analytics and insights
- [ ] Custom webhook integrations
- [ ] White-label dashboard options
- [ ] Enterprise SLAs and support

## 📚 Documentation

- **[X402 Protocol Guide](./X402.md)** - Complete HTTP 402 implementation guide with examples
- **[AgentForce Documentation](./AGENTFORCE.md)** - Autonomous agent marketplace architecture
- **[AgentForce Architecture](./AGENTFORCE_ARCHITECTURE.md)** - Technical deep dive
- **[Testing Guide](./TESTING.md)** - How to test 402pay components

## 💼 Use Cases

### API Monetization
Turn any API into a revenue stream with per-request pricing, subscriptions, or usage-based billing.

### AI Agent Commerce
Enable AI agents to autonomously discover, hire, and pay for services from other agents.

### Micro-Transactions
Accept payments as low as fractions of a cent without worrying about transaction fees.

### Content Paywalls
Monetize premium content with instant, frictionless payments.

## 📄 License

MIT

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/402pay/issues)
- Discord: [Join our community](#)
- Email: support@402pay.io

---

**Built with ❤️ for the Solana x402 ecosystem**
